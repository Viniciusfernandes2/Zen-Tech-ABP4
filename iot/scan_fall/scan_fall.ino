#include <Wire.h>
#include <Adafruit_ADXL345_U.h>

// Objeto do sensor
Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22); // SDA=21, SCL=22 no ESP32

  if (!accel.begin()) {
    Serial.println("Não foi possível encontrar o ADXL345!");
    while (1);
  }

  Serial.println("ADXL345 inicializado com sucesso!");
}

void loop() {
  sensors_event_t event; 
  accel.getEvent(&event);

  // Aceleração em m/s²
  Serial.print("X: "); Serial.print(event.acceleration.x); 
  Serial.print("  Y: "); Serial.print(event.acceleration.y); 
  Serial.print("  Z: "); Serial.print(event.acceleration.z); 
  Serial.println(" m/s²");

  // Cálculo da aceleração total
  float totalAcc = sqrt(
    event.acceleration.x * event.acceleration.x +
    event.acceleration.y * event.acceleration.y +
    event.acceleration.z * event.acceleration.z
  );

  if (totalAcc < 3.0) { // próximo de queda livre
    Serial.println("⚠️ Queda detectada!");
  }

  delay(300);
}