#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_ADXL345_U.h>
#include <Adafruit_SSD1306.h>
#include <HTTPClient.h>
#include <math.h>
#include <ArduinoJson.h>

// === OBJETOS ===
Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);
Adafruit_SSD1306 display(128, 64, &Wire, -1);

// === CONFIG WIFI ===
const char* ssid = "EUNICE";       
const char* password = "Eunice100523";   

// 🌐 Endereço do backend (IP do seu servidor)
String serverURL = "http://192.168.0.6:3000/api";  

// Variáveis para configuração dinâmica
String wifiLocal = "";
String senhaLocal = "";
String ipLivre = "";

bool quedaLivre = false;
bool wifiConfigurado = false;
unsigned long ultimaQuedaEnviada = 0;
const unsigned long INTERVALO_QUEDAS = 10000; // 10 segundos entre quedas

// Estrutura para armazenar dados de queda
struct DadosQueda {
  bool queda;
  float x;
  float y;
  float z;
  float total;
  String data;
  String horario;
};

void setup() {
  Serial.begin(115200);
  delay(1000);

  Wire.begin(21, 22); // SDA e SCL

  // === Inicializa DISPLAY ===
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("❌ Display OLED não encontrado!");
    while (1);
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Iniciando...");
  display.display();

  // === Inicializa ADXL345 ===
  if (!accel.begin()) {
    Serial.println("❌ Sensor ADXL345 não encontrado!");
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("Sensor erro!");
    display.display();
    while (1);
  }
  accel.setRange(ADXL345_RANGE_16_G);
  Serial.println("✅ ADXL345 pronto!");

  // === Conecta Wi-Fi ===
  conectarWiFi();

  // Buscar configurações do servidor
  buscarConfiguracoesServidor();
}

void loop() {
  sensors_event_t event;
  accel.getEvent(&event);

  float x = event.acceleration.x;
  float y = event.acceleration.y;
  float z = event.acceleration.z;
  float total = sqrt(x * x + y * y + z * z);

  Serial.printf("X: %.2f | Y: %.2f | Z: %.2f | Total: %.2f m/s²\n", x, y, z, total);

  // === Lógica de detecção de queda ===
  if (total < 4.5 && !quedaLivre) {  // quando maior mais sensível
    quedaLivre = true;
    Serial.println("⚠️ Queda livre detectada...");
  }

  if (quedaLivre && total > 10.5) {  // quanto menor mais sensivel
    unsigned long agora = millis();
    if (agora - ultimaQuedaEnviada > INTERVALO_QUEDAS) {
      Serial.println("💥 QUEDA DETECTADA! Enviando dados...");
      
      DadosQueda dados;
      dados.queda = true;
      dados.x = x;
      dados.y = y;
      dados.z = z;
      dados.total = total;
      dados.data = obterDataAtual();
      dados.horario = obterHorarioAtual();
      
      enviarDadosQueda(dados);
      ultimaQuedaEnviada = agora;
      
      // Mostra alerta no display
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println("💥 QUEDA DETECTADA!");
      display.printf("X: %.2f\nY: %.2f\n", x, y);
      display.printf("Z: %.2f\nT: %.2f\n", z, total);
      display.println("Enviando dados...");
      display.display();
      
      delay(3000); // pausa para exibir mensagem
      
      // Buscar histórico após queda
      buscarHistoricoQuedas();
    }
    quedaLivre = false;
  }

  // Verificar conexão WiFi periodicamente
  static unsigned long ultimaVerificacaoWiFi = 0;
  if (millis() - ultimaVerificacaoWiFi > 30000) { // Verificar a cada 30 segundos
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("📶 Reconectando WiFi...");
      conectarWiFi();
    }
    ultimaVerificacaoWiFi = millis();
  }

  // === Atualiza leitura normal ===
  display.clearDisplay();
  display.setCursor(0, 0);
  display.printf("X: %.2f\nY: %.2f\n", x, y);
  display.printf("Z: %.2f\n", z);
  display.printf("Total: %.2f\n", total);
  display.println(quedaLivre ? "Q. Livre!" : "Monitorando");
  display.println(WiFi.status() == WL_CONNECTED ? "WiFi: OK" : "WiFi: OFF");
  display.display();

  delay(200);
}

void conectarWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("📶 Conectando ao Wi-Fi");
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Conectando Wi-Fi...");
  display.display();

  int tentativas = 0;
  while (WiFi.status() != WL_CONNECTED && tentativas < 20) {
    delay(500);
    Serial.print(".");
    tentativas++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Conectado!");
    Serial.print("IP local: ");
    Serial.println(WiFi.localIP());
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("Wi-Fi conectado!");
    display.println(WiFi.localIP());
    display.display();
    delay(2000);
  } else {
    Serial.println("\n❌ Falha ao conectar!");
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("Falha Wi-Fi!");
    display.println("Reiniciando...");
    display.display();
    delay(3000);
    ESP.restart();
  }
}

void enviarDadosQueda(DadosQueda dados) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ Sem conexão Wi-Fi!");
    return;
  }

  HTTPClient http;
  http.begin(serverURL + "/queda");
  http.addHeader("Content-Type", "application/json");

  // Criar JSON manualmente
  String body = "{";
  body += "\"queda\":true,";
  body += "\"x\":" + String(dados.x, 2) + ",";
  body += "\"y\":" + String(dados.y, 2) + ",";
  body += "\"z\":" + String(dados.z, 2) + ",";
  body += "\"total\":" + String(dados.total, 2) + ",";
  body += "\"data\":\"" + dados.data + "\",";
  body += "\"horario\":\"" + dados.horario + "\"";
  body += "}";

  int code = http.POST(body);

  Serial.printf("📤 Enviado: %s | Código: %d\n", body.c_str(), code);
  if (code > 0) {
    Serial.println("✅ Envio bem-sucedido!");
    
    // Exibir confirmação no display
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.println("✅ Dados Enviados!");
    display.printf("Codigo: %d\n", code);
    display.printf("Data: %s\n", dados.data.c_str());
    display.printf("Hora: %s", dados.horario.c_str());
    display.display();
    delay(2000);
  } else {
    Serial.printf("❌ Falha no envio: %s\n", http.errorToString(code).c_str());
  }

  http.end();
}

void buscarHistoricoQuedas() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ Sem conexão Wi-Fi!");
    return;
  }

  HTTPClient http;
  String historicoURL = serverURL + "/queda/historico";
  
  http.begin(historicoURL);
  int code = http.GET();

  if (code == 200) {
    String response = http.getString();
    Serial.println("📋 Histórico de quedas recebido:");
    Serial.println(response);

    // Parse do JSON
    DynamicJsonDocument doc(2048);
    DeserializationError error = deserializeJson(doc, response);

    if (!error) {
      // Exibir no display
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println("📋 HISTORICO");
      display.println("Ultimas Quedas:");
      display.println("---------------");

      int count = 0;
      for (JsonObject queda : doc.as<JsonArray>()) {
        if (count >= 3) break; // Mostrar apenas 3 quedas
        
        const char* data = queda["data"];
        const char* horario = queda["horario"];
        float total = queda["total"];
        
        // Formatar para caber no display
        String linhaData = String(data) + " " + String(horario);
        if (linhaData.length() > 20) {
          linhaData = linhaData.substring(0, 20);
        }
        
        display.println(linhaData);
        display.printf("%.1f m/s²", total);
        display.println("\n---");
        
        count++;
      }
      
      if (count == 0) {
        display.println("Nenhuma queda");
      }
      
      display.display();
      delay(5000); // Mostrar histórico por 5 segundos
    } else {
      Serial.println("❌ Erro ao parsear histórico");
    }
  } else {
    Serial.printf("❌ Falha ao buscar histórico: %s\n", http.errorToString(code).c_str());
  }

  http.end();
}

void buscarConfiguracoesServidor() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ Sem conexão Wi-Fi!");
    return;
  }

  HTTPClient http;
  String configURL = serverURL + "/enviar";
  
  http.begin(configURL);
  http.addHeader("Content-Type", "application/json");
  
  // Enviar solicitação vazia para obter configurações
  String body = "{\"solicitar_config\":true}";
  int code = http.POST(body);

  if (code == 200) {
    String response = http.getString();
    Serial.println("⚙️ Configurações recebidas:");
    Serial.println(response);

    // Parse das configurações
    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, response);

    if (!error) {
      if (doc.containsKey("wifiLocal")) {
        wifiLocal = doc["wifiLocal"].as<String>();
        senhaLocal = doc["senhaLocal"].as<String>();
        ipLivre = doc["ipLivre"].as<String>();
        
        Serial.println("📡 Configurações atualizadas:");
        Serial.println("WiFi: " + wifiLocal);
        Serial.println("IP Livre: " + ipLivre);
        
        // Mostrar no display
        display.clearDisplay();
        display.setTextSize(1);
        display.setCursor(0, 0);
        display.println("⚙️ CONFIGURACOES");
        display.println("WiFi: " + wifiLocal);
        
        // Mostrar apenas parte do IP se for muito longo
        if (ipLivre.length() > 15) {
          display.println("IP: " + ipLivre.substring(0, 15) + "...");
        } else {
          display.println("IP: " + ipLivre);
        }
        
        display.display();
        delay(3000);
      }
    } else {
      Serial.println("❌ Erro ao parsear configurações");
    }
  } else {
    Serial.printf("❌ Falha ao buscar configurações: %s\n", http.errorToString(code).c_str());
  }

  http.end();
}

String obterDataAtual() {
  // Para um projeto real, use um módulo RTC ou NTP
  // Aqui vamos simular com o tempo de execução
  unsigned long segundos = millis() / 1000;
  unsigned long minutos = segundos / 60;
  unsigned long horas = minutos / 60;
  unsigned long dias = horas / 24;
  
  // Data fictícia baseada no tempo de execução
  int dia = (dias % 30) + 1;
  int mes = ((dias / 30) % 12) + 1;
  int ano = 2025;
  
  char data[11];
  snprintf(data, sizeof(data), "%02d/%02d/%04d", dia, mes, ano);
  return String(data);
}

String obterHorarioAtual() {
  // Para um projeto real, use um módulo RTC ou NTP
  // Aqui vamos simular com o tempo de execução
  unsigned long segundos = millis() / 1000;
  unsigned long minutos = segundos / 60;
  unsigned long horas = minutos / 60;
  
  int hora = horas % 24;
  int minuto = minutos % 60;
  int segundo = segundos % 60;
  
  char horario[9];
  snprintf(horario, sizeof(horario), "%02d:%02d:%02d", hora, minuto, segundo);
  return String(horario);
}

// Função para teste manual via Serial
void processarComandoSerial() {
  if (Serial.available()) {
    String comando = Serial.readStringUntil('\n');
    comando.trim();
    
    if (comando == "teste") {
      Serial.println("🔧 Enviando teste de queda...");
      DadosQueda teste;
      teste.queda = true;
      teste.x = 1.5;
      teste.y = 2.3;
      teste.z = 9.8;
      teste.total = 10.2;
      teste.data = obterDataAtual();
      teste.horario = obterHorarioAtual();
      enviarDadosQueda(teste);
    }
    else if (comando == "historico") {
      Serial.println("🔧 Buscando histórico...");
      buscarHistoricoQuedas();
    }
    else if (comando == "config") {
      Serial.println("🔧 Buscando configurações...");
      buscarConfiguracoesServidor();
    }
    else if (comando == "status") {
      Serial.println("🔧 Status do sistema:");
      Serial.printf("WiFi: %s\n", WiFi.status() == WL_CONNECTED ? "Conectado" : "Desconectado");
      Serial.printf("IP: %s\n", WiFi.localIP().toString().c_str());
      Serial.printf("Quedas detectadas: %lu\n", ultimaQuedaEnviada > 0 ? 1 : 0);
    }
    else if (comando == "reiniciar") {
      Serial.println("🔧 Reiniciando...");
      ESP.restart();
    }
    else {
      Serial.println("Comandos disponíveis:");
      Serial.println("teste - Enviar queda teste");
      Serial.println("historico - Buscar histórico");
      Serial.println("config - Buscar configurações");
      Serial.println("status - Status do sistema");
      Serial.println("reiniciar - Reiniciar ESP32");
    }
  }
}

void loop() {
  // Processar comandos serial (para testes)
  processarComandoSerial();
  
  // Leitura do sensor e detecção de quedas
  sensors_event_t event;
  accel.getEvent(&event);

  float x = event.acceleration.x;
  float y = event.acceleration.y;
  float z = event.acceleration.z;
  float total = sqrt(x * x + y * y + z * z);

  // Detecção de queda (mesma lógica anterior)
  if (total < 4.5 && !quedaLivre) {
    quedaLivre = true;
    Serial.println("⚠️ Queda livre detectada...");
  }

  if (quedaLivre && total > 10.5) {
    unsigned long agora = millis();
    if (agora - ultimaQuedaEnviada > INTERVALO_QUEDAS) {
      Serial.println("💥 QUEDA DETECTADA! Enviando dados...");
      
      DadosQueda dados;
      dados.queda = true;
      dados.x = x;
      dados.y = y;
      dados.z = z;
      dados.total = total;
      dados.data = obterDataAtual();
      dados.horario = obterHorarioAtual();
      
      enviarDadosQueda(dados);
      ultimaQuedaEnviada = agora;
      
      // Mostrar alerta
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println("💥 QUEDA DETECTADA!");
      display.printf("X: %.2f\nY: %.2f\n", x, y);
      display.printf("Z: %.2f\nT: %.2f\n", z, total);
      display.println("Enviando dados...");
      display.display();
      
      delay(3000);
      
      buscarHistoricoQuedas();
    }
    quedaLivre = false;
  }

  // Verificação periódica do WiFi
  static unsigned long ultimaVerificacaoWiFi = 0;
  if (millis() - ultimaVerificacaoWiFi > 30000) {
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("📶 Reconectando WiFi...");
      conectarWiFi();
    }
    ultimaVerificacaoWiFi = millis();
  }

  // Atualização do display
  display.clearDisplay();
  display.setCursor(0, 0);
  display.printf("X: %.2f\nY: %.2f\n", x, y);
  display.printf("Z: %.2f\n", z);
  display.printf("Total: %.2f\n", total);
  display.println(quedaLivre ? "Q. Livre!" : "Monitorando");
  display.println(WiFi.status() == WL_CONNECTED ? "WiFi: OK" : "WiFi: OFF");
  display.display();

  delay(200);
}