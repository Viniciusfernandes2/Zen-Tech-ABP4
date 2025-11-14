#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <SPIFFS.h>
#include <ArduinoJson.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>

#define DEBUG 1

// -------- CONFIG ----------
const char* WIFI_SSID = "SUA_SSID";
const char* WIFI_PASS = "SUA_SENHA";

// Use HTTPS endpoint (strongly recommended). Example: https://meu-backend.example.com
const char* API_BASE_URL = "https://seu-backend.example.com"; // colocar /api no final

// Paths
const char* PATH_REGISTER = "/device/register";
const char* PATH_EVENT = "/device/event";
const char* PATH_HEARTBEAT = "/device/heartbeat";

// Timings (ms)
const unsigned long HEARTBEAT_INTERVAL_MS = 30UL * 1000UL; // 30s
const unsigned long WIFI_RECONNECT_BASE_MS = 2000; // backoff base
const unsigned long EVENT_RETRY_BASE_MS = 5000; // base retry for failed POST
const unsigned long FALL_COOLDOWN_MS = 15UL * 1000UL; // 15s cooldown after a detected fall

// Sensor / detection
const int SAMPLE_RATE_HZ = 50; // 50 Hz
const float G = 9.81; // m/s^2 conversion
const float THRESHOLD_FREEFALL_G = 0.5; // below this => possible freefall (g)
const float THRESHOLD_IMPACT_G = 2.8; // above this => impact
const unsigned long WINDOW_IMPACT_MS = 800; // window to see impact after freefall
const unsigned long WINDOW_IMMOBILITY_MS = 1200; // check immobility duration after impact
const float VARIANCE_IMMOBILITY_THRESHOLD = 0.05; // small variance threshold (g^2) (tune)

// Storage
Preferences prefs;
const char* PREF_NAMESPACE = "bioalert";
const char* PREF_DEVICE_TOKEN = "device_token";
const char* PREF_DEVICE_ID = "device_id";
const char* PREF_EVENT_COUNTER = "evt_counter";

// Queue file on SPIFFS
const char* QUEUE_FILE = "/event_queue.json";

// Globals
Adafruit_MPU6050 mpu;

String deviceToken = "";
String deviceId = "";
uint32_t eventCounter = 0;

unsigned long lastHeartbeat = 0;
unsigned long lastWifiAttempt = 0;
unsigned long nextWifiDelay = WIFI_RECONNECT_BASE_MS;

unsigned long lastFallTime = 0;
bool inCooldown = false;

// For sampling
unsigned long lastSampleMillis = 0;
unsigned long sampleIntervalMs = 1000UL / SAMPLE_RATE_HZ;

// For fall detection state
bool potentialFreefall = false;
unsigned long freefallStartMs = 0;
bool impactSeen = false;
unsigned long impactMs = 0;

// Simple circular queue for pending events managed in SPIFFS file
// We'll push JSON objects into an array stored in QUEUE_FILE

// ---------- UTIL helpers ----------
void logd(const char* fmt, ...) {
#if DEBUG
  va_list args;
  va_start(args, fmt);
  vprintf(fmt, args);
  va_end(args);
  Serial.println();
#endif
}

String isoNow() {
  time_t now = time(nullptr);
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  char buf[32];
  // produce ISO 8601 UTC
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(buf);
}

String generateEventId() {
  eventCounter++;
  prefs.putUInt(PREF_EVENT_COUNTER, eventCounter);
  // event id: deviceId-counter-timestamp
  return deviceId + "-" + String(eventCounter) + "-" + String(millis());
}

// SPIFFS queue helpers
bool queueInit() {
  if (!SPIFFS.begin(true)) {
    logd("SPIFFS mount failed");
    return false;
  }
  // create file if not exists
  if (!SPIFFS.exists(QUEUE_FILE)) {
    File f = SPIFFS.open(QUEUE_FILE, FILE_WRITE);
    if (!f) {
      logd("Queue file create failed");
      return false;
    }
    f.print("[]");
    f.close();
  }
  return true;
}

bool queuePush(JsonObject eventObj) {
  // read array, append object, write back
  File f = SPIFFS.open(QUEUE_FILE, FILE_READ);
  if (!f) return false;
  size_t size = f.size();
  std::unique_ptr<char[]> buf(new char[size + 1]);
  f.readBytes(buf.get(), size);
  buf[size] = 0;
  f.close();

  DynamicJsonDocument doc(4096);
  DeserializationError err = deserializeJson(doc, buf.get());
  if (err) {
    logd("queue deserialize error");
    return false;
  }
  JsonArray arr = doc.as<JsonArray>();
  arr.add(eventObj);

  // write back
  File fw = SPIFFS.open(QUEUE_FILE, FILE_WRITE);
  if (!fw) return false;
  serializeJson(doc, fw);
  fw.close();
  return true;
}

bool queuePop(JsonObject &outEvent) {
  // pop first element; returns false if empty
  File f = SPIFFS.open(QUEUE_FILE, FILE_READ);
  if (!f) return false;
  size_t size = f.size();
  std::unique_ptr<char[]> buf(new char[size + 1]);
  f.readBytes(buf.get(), size);
  buf[size] = 0;
  f.close();

  DynamicJsonDocument doc(8192);
  DeserializationError err = deserializeJson(doc, buf.get());
  if (err) {
    logd("queue deserialize error pop");
    return false;
  }
  JsonArray arr = doc.as<JsonArray>();
  if (arr.size() == 0) return false;

  // get first object
  JsonVariant first = arr[0];
  outEvent = first.as<JsonObject>();

  // remove first
  JsonArray newArr = doc.createNestedArray("new");
  for (size_t i = 1; i < arr.size(); ++i) {
    newArr.add(arr[i]);
  }
  // rewrite file with newArr
  DynamicJsonDocument outDoc(8192);
  JsonArray oa = outDoc.to<JsonArray>();
  for (size_t i = 1; i < arr.size(); ++i) {
    oa.add(arr[i]);
  }
  File fw = SPIFFS.open(QUEUE_FILE, FILE_WRITE);
  if (!fw) return false;
  serializeJson(outDoc, fw);
  fw.close();
  return true;
}

size_t queueSize() {
  File f = SPIFFS.open(QUEUE_FILE, FILE_READ);
  if (!f) return 0;
  size_t size = f.size();
  std::unique_ptr<char[]> buf(new char[size + 1]);
  f.readBytes(buf.get(), size);
  buf[size] = 0;
  f.close();
  DynamicJsonDocument doc(4096);
  DeserializationError err = deserializeJson(doc, buf.get());
  if (err) return 0;
  JsonArray arr = doc.as<JsonArray>();
  return arr.size();
}

// HTTP helpers (uses WiFiClientSecure)
bool httpPostJson(const String &urlPath, const String &jsonBody, const String &bearerToken, int &outCode, String &outBody) {
  if (WiFi.status() != WL_CONNECTED) {
    outCode = -1;
    outBody = "No WiFi";
    return false;
  }

  String fullUrl = String(API_BASE_URL) + urlPath;
  WiFiClientSecure *client = new WiFiClientSecure();
  client->setInsecure(); // NOTE: for prod replace with CA verification!
  HTTPClient https;
  bool ok = false;
  outCode = -1;
  outBody = "";

  if (https.begin(*client, fullUrl)) {
    https.setTimeout(10000);
    https.addHeader("Content-Type", "application/json");
    if (bearerToken.length() > 0) {
      https.addHeader("Authorization", "Bearer " + bearerToken);
    }
    int httpCode = https.POST(jsonBody);
    outCode = httpCode;
    if (httpCode > 0) {
      outBody = https.getString();
      ok = true;
    } else {
      outBody = "HTTP POST failed";
      ok = false;
    }
    https.end();
  } else {
    outBody = "HTTPS begin failed";
    ok = false;
  }

  delete client;
  return ok;
}

// Register device (POST /device/register)
bool doRegisterDevice() {
  DynamicJsonDocument doc(512);
  doc["codigo_esp"] = deviceId.length() ? deviceId : String("DEV-") + String((uint32_t)ESP.getEfuseMac(), HEX);
  doc["nome"] = "BioAlert-ESP32";

  String body;
  serializeJson(doc, body);

  int code;
  String resp;
  bool ok = httpPostJson(String(PATH_REGISTER), body, "", code, resp);
  if (!ok) {
    logd("register http fail code=%d body=%s", code, resp.c_str());
    return false;
  }
  // parse response JSON for device_token & device_id
  DynamicJsonDocument rdoc(1024);
  DeserializationError err = deserializeJson(rdoc, resp);
  if (err) {
    logd("register parse error");
    return false;
  }
  if (rdoc.containsKey("device_token")) {
    String token = rdoc["device_token"].as<String>();
    prefs.putString(PREF_DEVICE_TOKEN, token);
    deviceToken = token;
    logd("device token saved len=%d", deviceToken.length());
  }
  if (rdoc.containsKey("device_id")) {
    String did = rdoc["device_id"].as<String>();
    prefs.putString(PREF_DEVICE_ID, did);
    deviceId = did;
  }
  return true;
}

// Heartbeat
bool doHeartbeat() {
  DynamicJsonDocument doc(256);
  doc["ping"] = true;
  doc["ts"] = isoNow();
  String body; serializeJson(doc, body);

  int code; String resp;
  bool ok = httpPostJson(String(PATH_HEARTBEAT), body, deviceToken, code, resp);
  if (!ok) {
    logd("heartbeat http fail code=%d %s", code, resp.c_str());
    return false;
  }
  if (code == 200) {
    logd("heartbeat ok");
    return true;
  } else if (code == 401 || code == 403) {
    // token revoked
    logd("heartbeat unauthorized -> token revoked");
    prefs.remove(PREF_DEVICE_TOKEN);
    deviceToken = "";
    return false;
  }
  return false;
}

// Send event (immediate; if fail push to queue)
bool sendEventNow(JsonObject &evt) {
  String body;
  DynamicJsonDocument doc(8192);
  doc.to<JsonObject>() = evt; // copy object into doc to serialize properly
  serializeJson(doc, body);

  int code; String resp;
  bool ok = httpPostJson(String(PATH_EVENT), body, deviceToken, code, resp);
  if (!ok) {
    logd("sendEventNow http fail code=%d %s", code, resp.c_str());
    // if unauthorized => remove token to force re-register
    if (code == 401 || code == 403) {
      prefs.remove(PREF_DEVICE_TOKEN);
      deviceToken = "";
    }
    return false;
  }
  if (code == 201 || code == 200) {
    logd("event sent ok code=%d", code);
    return true;
  } else {
    logd("event rejected code=%d body=%s", code, resp.c_str());
    if (code == 401 || code == 403) {
      prefs.remove(PREF_DEVICE_TOKEN);
      deviceToken = "";
    }
    return false;
  }
}

// Try to flush local queue
void flushQueue() {
  if (!SPIFFS.exists(QUEUE_FILE)) return;
  // read queue
  File f = SPIFFS.open(QUEUE_FILE, FILE_READ);
  if (!f) return;
  size_t size = f.size();
  std::unique_ptr<char[]> buf(new char[size + 1]);
  f.readBytes(buf.get(), size);
  buf[size] = 0;
  f.close();

  DynamicJsonDocument doc(8192);
  DeserializationError err = deserializeJson(doc, buf.get());
  if (err) {
    logd("flushQueue parse err");
    return;
  }
  JsonArray arr = doc.as<JsonArray>();
  if (arr.size() == 0) return;

  // Attempt send each from front, removing on success
  DynamicJsonDocument outDoc(8192);
  JsonArray newArr = outDoc.to<JsonArray>();
  for (size_t i = 0; i < arr.size(); ++i) {
    JsonObject ev = arr[i].as<JsonObject>();
    // try send
    bool sent = sendEventNow(ev);
    if (!sent) {
      // keep in newArr
      newArr.add(ev);
    } else {
      logd("flushed event[%d]", i);
    }
    delay(50); // small pause
  }
  // write back remaining
  File fw = SPIFFS.open(QUEUE_FILE, FILE_WRITE);
  if (!fw) {
    logd("flushQueue write failed");
    return;
  }
  serializeJson(outDoc, fw);
  fw.close();
}

// enqueue event
bool enqueueEvent(JsonObject &evt) {
  // append to array in file
  File f = SPIFFS.open(QUEUE_FILE, FILE_READ);
  if (!f) {
    logd("enqueue: can't open queue read");
    return false;
  }
  size_t size = f.size();
  std::unique_ptr<char[]> buf(new char[size + 1]);
  f.readBytes(buf.get(), size);
  buf[size] = 0;
  f.close();

  DynamicJsonDocument doc(8192);
  DeserializationError err = deserializeJson(doc, buf.get());
  if (err) {
    logd("enqueue parse err");
    return false;
  }
  JsonArray arr = doc.as<JsonArray>();
  arr.add(evt);

  File fw = SPIFFS.open(QUEUE_FILE, FILE_WRITE);
  if (!fw) {
    logd("enqueue write failed");
    return false;
  }
  serializeJson(doc, fw);
  fw.close();
  return true;
}

// Called when a fall is detected: builds event object & sends or queues it
void handleFallDetected(float ax, float ay, float az, float totalg) {
  if (inCooldown && (millis() - lastFallTime) < FALL_COOLDOWN_MS) {
    logd("in cooldown ignore");
    return;
  }

  lastFallTime = millis();
  inCooldown = true;

  DynamicJsonDocument doc(4096);
  String eventId = generateEventId();
  doc["event_id"] = eventId;
  doc["event_type"] = "queda";
  doc["source_timestamp"] = isoNow();
  doc["eixo_x"] = ax;
  doc["eixo_y"] = ay;
  doc["eixo_z"] = az;
  doc["totalacc"] = totalg;
  // raw payload example: small last-samples array - omitted for brevity, you may add
  JsonObject raw = doc.createNestedObject("raw_payload");
  raw["note"] = "mini-sample omitted";

  JsonObject evt = doc.as<JsonObject>();

  // try immediate send
  bool sent = sendEventNow(evt);
  if (!sent) {
    // push to queue
    logd("pushing event to queue");
    enqueueEvent(evt);
  } else {
    logd("event delivered");
  }
}

// ---------- SETUP ----------
void setup() {
  Serial.begin(115200);
  delay(1000);
  logd("Booting...");

  // mount SPIFFS
  if (!SPIFFS.begin(true)) {
    logd("SPIFFS failed to mount");
  } else {
    logd("SPIFFS mounted");
  }

  // Preferences
  prefs.begin(PREF_NAMESPACE, false);
  deviceToken = prefs.getString(PREF_DEVICE_TOKEN, "");
  deviceId = prefs.getString(PREF_DEVICE_ID, "");
  eventCounter = prefs.getUInt(PREF_EVENT_COUNTER, 0);

  // use efuse mac if no deviceId set
  if (deviceId.length() == 0) {
    uint64_t mac = ESP.getEfuseMac();
    char buf[32];
    sprintf(buf, "dev-%04llx", mac & 0xffff);
    deviceId = String(buf);
    prefs.putString(PREF_DEVICE_ID, deviceId);
  }

  // connect wifi
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  lastWifiAttempt = millis();

  // init sensor
  Wire.begin();
  if (!mpu.begin()) {
    logd("Failed to find MPU6050 chip");
    // let the program continue - but sensor not present will break fall detection
  } else {
    logd("MPU6050 found");
    mpu.setAccelerometerRange(MPU_ACCEL_RANGE_4_G);
    mpu.setGyroRange(MPU_GYRO_RANGE_250_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  }

  // start SNTP - sync time
  configTime(0, 0, "pool.ntp.org", "time.google.com");
  logd("Setup done");
}

// ---------- MAIN LOOP ----------
void loop() {
  // Handle WiFi reconnection (non-blocking)
  if (WiFi.status() != WL_CONNECTED) {
    unsigned long now = millis();
    if (now - lastWifiAttempt >= nextWifiDelay) {
      logd("Trying WiFi connect...");
      WiFi.disconnect();
      WiFi.reconnect();
      lastWifiAttempt = now;
      // exponential backoff up to 2 minutes
      nextWifiDelay = min(nextWifiDelay * 2, 120000UL);
    }
  } else {
    // reset backoff
    nextWifiDelay = WIFI_RECONNECT_BASE_MS;
  }

  // If connected but no token, try register
  if (WiFi.status() == WL_CONNECTED && deviceToken.length() == 0) {
    logd("No device token, registering...");
    bool registered = doRegisterDevice();
    if (!registered) {
      logd("register failed, will retry later");
      delay(2000);
    } else {
      logd("registered ok tokenLen=%d", deviceToken.length());
    }
  }

  // Heartbeat
  if (WiFi.status() == WL_CONNECTED && deviceToken.length() > 0) {
    unsigned long now = millis();
    if (now - lastHeartbeat >= HEARTBEAT_INTERVAL_MS) {
      lastHeartbeat = now;
      bool ok = doHeartbeat();
      if (!ok) {
        logd("heartbeat failed");
        // if deviceToken was removed by server, next loop will re-register
      } else {
        // on success, try flush queue
        flushQueue();
      }
    }
  }

  // Sensor sampling at SAMPLE_RATE_HZ
  if (millis() - lastSampleMillis >= sampleIntervalMs) {
    lastSampleMillis = millis();
    if (mpu.begin()) {
      sensors_event_t a, g, temp;
      mpu.getEvent(&a, &g, &temp);
      // a.acceleration.x (m/s^2)
      float ax = a.acceleration.x;
      float ay = a.acceleration.y;
      float az = a.acceleration.z;
      // compute total g
      float totalAccMs2 = sqrt(ax*ax + ay*ay + az*az);
      float totalG = totalAccMs2 / G; // in g units

      // Simple low-pass filter could be applied here if needed

      // FALL DETECTION LOGIC (3 phases)
      unsigned long now = millis();

      // Phase 1: potential freefall
      if (!potentialFreefall && totalG < THRESHOLD_FREEFALL_G) {
        potentialFreefall = true;
        freefallStartMs = now;
        impactSeen = false;
        logd("potential freefall start totalG=%.2f", totalG);
      }

      // If in potential freefall, look for impact within window
      if (potentialFreefall && !impactSeen) {
        if (totalG > THRESHOLD_IMPACT_G && (now - freefallStartMs) <= WINDOW_IMPACT_MS) {
          impactSeen = true;
          impactMs = now;
          logd("impact seen totalG=%.2f", totalG);
        } else if ((now - freefallStartMs) > WINDOW_IMPACT_MS) {
          // timed out, reset
          potentialFreefall = false;
          impactSeen = false;
          logd("freefall timed out, reset");
        }
      }

      // After impact, check immobility for WINDOW_IMMOBILITY_MS
      if (impactSeen) {
        // gather small buffer of samples for variance calculation - for simplicity we check current variance using few reads
        // A real implementation would sample for WINDOW_IMMOBILITY_MS and compute variance; we approximated here
        static float lastSamples[10];
        static int idx = 0;
        lastSamples[idx++] = totalG;
        if (idx >= 10) idx = 0;

        // compute variance
        float mean = 0;
        for (int i=0;i<10;i++) mean += lastSamples[i];
        mean /= 10.0;
        float var = 0;
        for (int i=0;i<10;i++) var += (lastSamples[i]-mean)*(lastSamples[i]-mean);
        var /= 10.0;

        if (var < VARIANCE_IMMOBILITY_THRESHOLD) {
          // immobility detected - confirm fall
          float ax_g = ax / G;
          float ay_g = ay / G;
          float az_g = az / G;
          logd("immobility var=%.4f -> CONFIRM FALL", var);
          handleFallDetected(ax_g, ay_g, az_g, totalG);
          potentialFreefall = false;
          impactSeen = false;
        } else {
          // still moving, maybe false alarm - reset after some time
          if ((now - impactMs) > (WINDOW_IMMOBILITY_MS + 200)) {
            potentialFreefall = false;
            impactSeen = false;
            logd("immobility not confirmed var=%.4f", var);
          }
        }
      }

      // cooldown cleaning
      if (inCooldown && (millis() - lastFallTime) > FALL_COOLDOWN_MS) {
        inCooldown = false;
      }
    } // end mpu read
  } // end sampling

  // small delay to keep loop alive
  delay(1);
}

