import { Router } from "express";
import { enviarParaESP } from '../../controllers/esp32Controller'


const router = Router();


router.post("/queda", (req, res) => {
  console.log("📡 Dados recebidos:", req.body);
  res.json({ status: "ok", recebido: req.body });

  
});

// Bruno Menezes 01.11.2025: Rota para enviar dados para ESP32
  router.post('/enviar', enviarParaESP);
  

export default router;


// Código exemplo para ESP32 que detecta quedas usando o sensor ADXL345
// #include <WiFi.h>
// #include <Wire.h>
// #include <Adafruit_ADXL345_U.h>
// #include <Adafruit_SSD1306.h>
// #include <HTTPClient.h>
// #include <math.h>

// // === OBJETOS ===
// Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);
// Adafruit_SSD1306 display(128, 64, &Wire, -1);

// // === CONFIG WIFI ===
// const char* ssid = "EUNICE";       
// const char* password = "Eunice100523";   

// // 🌐 Endereço do backend (IP do seu servidor)
// String serverURL = "http://192.168.0.6:3000/api/queda";  

// bool quedaLivre = false;

// void setup() {
//   Serial.begin(115200);
//   delay(1000);

//   Wire.begin(21, 22); // SDA e SCL

//   // === Inicializa DISPLAY ===
//   if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
//     Serial.println("❌ Display OLED não encontrado!");
//     while (1);
//   }
//   display.clearDisplay();
//   display.setTextSize(1);
//   display.setTextColor(SSD1306_WHITE);
//   display.println("Iniciando...");
//   display.display();

//   // === Inicializa ADXL345 ===
//   if (!accel.begin()) {
//     Serial.println("❌ Sensor ADXL345 não encontrado!");
//     display.println("Sensor erro!");
//     display.display();
//     while (1);
//   }
//   accel.setRange(ADXL345_RANGE_16_G);
//   Serial.println("✅ ADXL345 pronto!");

//   // === Conecta Wi-Fi ===
//   WiFi.begin(ssid, password);
//   Serial.print("📶 Conectando ao Wi-Fi");
//   display.clearDisplay();
//   display.println("Conectando Wi-Fi...");
//   display.display();

//   int tentativas = 0;
//   while (WiFi.status() != WL_CONNECTED && tentativas < 20) {
//     delay(500);
//     Serial.print(".");
//     tentativas++;
//   }

//   if (WiFi.status() == WL_CONNECTED) {
//     Serial.println("\n✅ Conectado!");
//     Serial.print("IP local: ");
//     Serial.println(WiFi.localIP());
//     display.clearDisplay();
//     display.println("Wi-Fi conectado!");
//     display.println(WiFi.localIP());
//     display.display();
//   } else {
//     Serial.println("\n❌ Falha ao conectar!");
//     display.clearDisplay();
//     display.println("Falha Wi-Fi!");
//     display.display();
//   }
// }

// void loop() {
//   sensors_event_t event;
//   accel.getEvent(&event);

//   float x = event.acceleration.x;
//   float y = event.acceleration.y;
//   float z = event.acceleration.z;
//   float total = sqrt(x * x + y * y + z * z);

//   Serial.printf("X: %.2f | Y: %.2f | Z: %.2f | Total: %.2f m/s²\n", x, y, z, total);

//   // === Lógica de detecção de queda ===
//   if (total < 4.5 && !quedaLivre) {  // quando maior mais sensível
//     quedaLivre = true;
//     Serial.println("⚠️ Queda livre detectada...");
//   }

//   if (quedaLivre && total > 10.5) {  // quanto menor mais sensivel
//     Serial.println("💥 QUEDA DETECTADA! Enviando dados...");
//     enviarDadosQueda(true, x, y, z, total);
//     quedaLivre = false;

//     // Mostra alerta no display
//     display.clearDisplay();
//     display.setTextSize(1);
//     display.setCursor(0, 0);
//     display.println("💥 QUEDA DETECTADA!");
//     display.printf("X: %.2f\nY: %.2f\nZ: %.2f\nT: %.2f\n", x, y, z, total);
//     display.display();

//     delay(2000); // pausa para exibir mensagem
//   }

//   // === Atualiza leitura normal ===
//   display.clearDisplay();
//   display.setCursor(0, 0);
//   display.printf("X: %.2f\nY: %.2f\nZ: %.2f\n", x, y, z);
//   display.printf("Total: %.2f\n", total);
//   display.println(quedaLivre ? "Detectando..." : "OK");
//   display.display();

//   delay(200);
// }

// void enviarDadosQueda(bool queda, float x, float y, float z, float total) {
//   if (WiFi.status() != WL_CONNECTED) {
//     Serial.println("❌ Sem conexão Wi-Fi!");
//     return;
//   }

//   HTTPClient http;
//   http.begin(serverURL);
//   http.addHeader("Content-Type", "application/json");

//   String body = "{\"queda\":" + String(queda ? "true" : "false") +
//                 ",\"x\":" + String(x, 2) +
//                 ",\"y\":" + String(y, 2) +
//                 ",\"z\":" + String(z, 2) +
//                 ",\"total\":" + String(total, 2) + "}";

//   int code = http.POST(body);

//   Serial.printf("📤 Enviado: %s | Código: %d\n", body.c_str(), code);
//   if (code > 0) Serial.println("✅ Envio bem-sucedido!");
//   else Serial.printf("❌ Falha no envio: %s\n", http.errorToString(code).c_str());

//   http.end();
// }
