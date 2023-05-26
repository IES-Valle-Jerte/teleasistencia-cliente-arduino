/*
  Rui Santos
  Complete project details at Complete project details at https://RandomNerdTutorials.com/esp8266-nodemcu-http-get-post-arduino/

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  
  Code compatible with ESP8266 Boards Version 3.0.0 or above 
  (see in Tools > Boards > Boards Manager > ESP8266)
*/

#include <WiFi.h>

#include <HTTPClient.h>

#include <WiFiClient.h>

const char * ssid = "terminal";
const char * password = "IESValleDelJertePlasencia";

unsigned long lastButtonPressTime = 0; // Variable para almacenar el tiempo del último botón presionado
unsigned long debounceDelay = 1000; // Tiempo mínimo entre cada envío de solicitud en milisegundos

//Your Domain name with URL path or IP address with path
// String serverName = "http://192.168.5.1:3000/destinos";
String serverName = "http://192.168.5.1:3000/terminalUCR";

bool hecho = false;
int counter = 0;

void setup() {
  Serial.begin(115200);

  pinMode(4, INPUT_PULLUP);

  WiFi.begin(ssid, password);
  Serial.println("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    connectToWiFi();
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());

  Serial.println("Timer set to 5 seconds (timerDelay variable), it will take 5 seconds before publishing the first reading.");
}

void loop() {

  int button = digitalRead(4);

  // Ponemos una condición para que sólo se envie una vez para ver si funciona correctamente
  if (!hecho) {
    //Check WiFi connection status
    if (WiFi.status() == WL_CONNECTED) {

      // Obtenemos los milisegundos encendidos
      long segundos_funcionando = millis();
      //  Generamos una autenticación dependiendo de la IP obtenida y el tiempo encendido
      long operacion_hora = segundos_funcionando * 1024 % 222 * 356 * WiFi.localIP()[3];

      String contentPost = "{\"tipo_sensor\":\"UCR\",";
      contentPost += "\"id\":\""+ String(1)+"\",";
      contentPost += "\"funcionando\":\"" + String(segundos_funcionando) + "\",";
      contentPost += "\"complemento\":\"" + String(operacion_hora) + "\"";
      contentPost += "}";

      WiFiClient client;
      HTTPClient http;

      // Your Domain name with URL path or IP address with path
      http.begin(client, serverName.c_str());

      // If you need Node-RED/server authentication, insert user and password below
      //http.setAuthorization("REPLACE_WITH_SERVER_USERNAME", "REPLACE_WITH_SERVER_PASSWORD");

      // POnemos la cabecera d ela petición
      http.addHeader("Content-Type", "application/json");
      // Send HTTP POST request

      int httpResponseCode;

      int buttonState = digitalRead(4); // Leer el estado del botón

      // Comprobar si el botón está presionado y ha pasado suficiente tiempo desde el último envío de solicitud
      if (buttonState == LOW && (millis() - lastButtonPressTime) >= debounceDelay) {
        // Registrar el tiempo actual del botón presionado
        lastButtonPressTime = millis();

        Serial.println("  > Alarma enviada");
        httpResponseCode = http.POST(contentPost);

        if (httpResponseCode == 200) {
          Serial.print("HTTP Response code: ");
          Serial.println(httpResponseCode);
          String payload = http.getString();

        } else {
          Serial.print("Error code: ");
          Serial.println(httpResponseCode);
        }
      }

      // Free resources
      http.end();
    } else {
      Serial.println("WiFi Disconnected");
    }
  }
}

void connectToWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("Connected to Wi-Fi");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}
