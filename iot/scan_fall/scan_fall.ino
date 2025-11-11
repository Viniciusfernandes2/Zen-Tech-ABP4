#include <Wire.h>
#include <Adafruit_ADXL345_U.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_SSD1306.h>

// ======== CONFIG Wi-Fi ========
const char* ssid = "SEU_WIFI";
const char* password = "SENHA_WIFI";

// ======== CONFIG SERVIDOR ========
const char* serverUrl = "http://SEU_BACKEND/api";

// ======== OLED CONFIG ========
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// ======== SENSOR CONFIG ========
Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);

// ======== VARIÁVEIS ========
String codigoDispositivo;
unsigned long lastSend = 0;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  // ----- OLED -----
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("Falha ao iniciar OLED!");
    for(;;);
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  // ----- WIFI -----
  WiFi.begin(ssid, password);
  Serial.print("Conectando ao Wi-Fi");
  display.setCursor(0, 0);
  display.println("Conectando Wi-Fi...");
  display.display();

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConectado ao Wi-Fi!");

  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Wi-Fi Conectado!");
  display.display();
  delay(1000);

  // ----- SENSOR -----
  if (!accel.begin()) {
    Serial.println("Não foi possível encontrar o ADXL345!");
    while (1);
  }

  // ----- GERA CÓDIGO ÚNICO -----
  codigoDispositivo = "ESP-" + String(WiFi.macAddress());
  codigoDispositivo.replace(":", "");
  Serial.println("Código do dispositivo: " + codigoDispositivo);

  // ----- REGISTRA NO BACKEND -----
  registrarDispositivo();

  // Mostra o código no OLED
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Dispositivo:");
  display.println(codigoDispositivo);
  display.println("");
  display.println("Cadastre este");
  display.println("codigo no app!");
  display.display();
}

void loop() {
  sensors_event_t event; 
  accel.getEvent(&event);

  float totalAcc = sqrt(
    event.acceleration.x * event.acceleration.x +
    event.acceleration.y * event.acceleration.y +
    event.acceleration.z * event.acceleration.z
  );

  if (totalAcc < 3.0 && millis() - lastSend > 5000) { // 5s entre alertas
    Serial.println("⚠️ Queda detectada!");
    enviarQueda();
    lastSend = millis();
  }

  delay(300);
}

// ====== Função: registrar no backend ======
void registrarDispositivo() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(serverUrl) + "/dispositivos/registrar";

    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    String body = "{\"codigo_esp\":\"" + codigoDispositivo + "\"}";
    int httpResponseCode = http.POST(body);

    Serial.print("Registrando dispositivo... Resposta: ");
    Serial.println(httpResponseCode);

    http.end();
  }
}

// ====== Função: enviar alerta de queda ======
void enviarQueda() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(serverUrl) + "/quedas";
    
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    String body = "{\"codigo_esp\":\"" + codigoDispositivo + "\"}";
    int httpResponseCode = http.POST(body);

    Serial.print("Enviando queda... Resposta: ");
    Serial.println(httpResponseCode);

    http.end();
  }
}
