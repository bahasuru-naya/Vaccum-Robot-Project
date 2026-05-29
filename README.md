# 🤖 VacBot — Autonomous Vacuum Robot

Welcome to the VacBot project! This guide explains how to set up the hardware, flash the firmware, run the simulator, and use the web dashboard.

## Hardware Wiring

Here is the complete table of all 20 connections for the ESP32-S3 and peripherals:

| Component | ESP32-S3 Pin | Note |
| :--- | :--- | :--- |
| **Left Motor (PWM)** | GPIO 4 (`PIN_LEFT_ENA`) | To L298N ENA |
| **Left Motor (IN1)** | GPIO 5 (`PIN_LEFT_IN1`) | To L298N IN1 |
| **Left Motor (IN2)** | GPIO 6 (`PIN_LEFT_IN2`) | To L298N IN2 |
| **Right Motor (PWM)**| GPIO 7 (`PIN_RIGHT_ENB`) | To L298N ENB |
| **Right Motor (IN3)**| GPIO 15 (`PIN_RIGHT_IN3`) | To L298N IN3 |
| **Right Motor (IN4)**| GPIO 16 (`PIN_RIGHT_IN4`) | To L298N IN4 |
| **Left Encoder** | GPIO 17 (`PIN_ENC_LEFT`) | Left wheel pulse input |
| **Right Encoder** | GPIO 18 (`PIN_ENC_RIGHT`) | Right wheel pulse input |
| **Sonar Trigger** | GPIO 10 (`PIN_TRIG`) | Shared trigger for all 3 sonars |
| **Front Sonar Echo** | GPIO 11 (`PIN_ECHO_FRONT`) | Front ultrasonic sensor |
| **Left Sonar Echo** | GPIO 12 (`PIN_ECHO_LEFT`) | Left ultrasonic sensor |
| **Right Sonar Echo** | GPIO 13 (`PIN_ECHO_RIGHT`) | Right ultrasonic sensor |
| **Battery Voltage** | GPIO 20 (`PIN_BATTERY`) | To voltage divider |
| **Vacuum Motor (PWM)**| GPIO 38 (`PIN_VAC_PWM`) | To TB6612FNG PWMA+PWMB |
| **Vacuum Motor (IN1)**| GPIO 47 (`PIN_VAC_IN1`) | To TB6612FNG AIN1+BIN1 |
| **Vacuum Motor (IN2)**| GPIO 45 (`PIN_VAC_IN2`) | To TB6612FNG AIN2+BIN2 |
| **Status LED** | GPIO 48 (`RGB_PIN`) | Adafruit NeoPixel RGB LED |
| **MPU6050 SDA** | GPIO 8 (`PIN_SDA`) | I2C Data |
| **MPU6050 SCL** | GPIO 9 (`PIN_SCL`) | I2C Clock |

*Note: Ensure TB6612FNG STBY pin is tied to 3.3V so the motor driver is active.*

## Libraries to Install

You must install the following libraries via the Arduino IDE Library Manager:
- **PubSubClient** (by Nick O'Leary)
- **Adafruit MPU6050** (by Adafruit)
- **Adafruit Unified Sensor** (by Adafruit)
- **Adafruit NeoPixel** (by Adafruit)
- **ArduinoJson** (by Benoit Blanchon)

## Step 1 — Flash Firmware

### Option A — PlatformIO (Recommended)

PlatformIO is pre-configured via `platformio.ini` at the project root. No code changes needed.

1. Install the **PlatformIO IDE** extension in VS Code (or install the CLI: `pip install platformio`).
2. Edit the `CONFIG` block at the top of `vacbot_firmware.ino` to set your `WIFI_SSID` and `WIFI_PASS`.
3. Open this folder in VS Code — PlatformIO will auto-detect `platformio.ini`.
4. Connect your ESP32-S3 via USB.
5. Click **Upload** (→ arrow) in the PlatformIO toolbar, or run from terminal:
   ```bash
   pio run --target upload
   ```
6. To open the Serial Monitor:
   ```bash
   pio device monitor
   ```
   All libraries are fetched automatically from the registry on first build.

### Option B — Arduino IDE (Legacy)

1. Open `vacbot_firmware.ino` in the Arduino IDE.
2. Edit the `CONFIG` block at the top of the file to set your `WIFI_SSID` and `WIFI_PASS`. (MQTT credentials are already set).
3. Under **Tools > Board**, select **ESP32S3 Dev Module**.
4. Set the **Upload Speed** to `921600`.
5. Connect your ESP32-S3 via USB and click **Upload**.

## Step 2 — Gyro Calibration

1. After flashing, place the robot on a completely flat surface and power it on.
2. The RGB LED will turn **BLUE** while connecting. 
3. **Keep the robot completely still for 3 seconds.** It is actively taking 600+ samples to calculate the gyroscope bias.
4. Next, the robot will briefly spin left to detect the gyro orientation sign.
5. Once calibration is done and WiFi/MQTT connect successfully, the LED will turn **GREEN**.

## Step 3 — Run Simulator (optional testing without hardware)

You can run the digital twin of the robot if you don't have the hardware ready:
1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. In this folder, run `npm install mqtt` in your terminal.
3. Run `node simulator.js`.
4. Wait 5 seconds for the simulator to perform its virtual gyro calibration.
5. Open the Dashboard (Step 4) to control the simulator!

## Step 4 — Open Dashboard

1. Open `index.html` in your web browser.
2. Click the gear icon to open settings.
3. Use the following credentials to connect to the broker:
   - **Host:** `0808028e417c4ff2957842f563dafe7b.s1.eu.hivemq.cloud`
   - **Port:** `8884` (for secure WebSockets)
   - **User:** `VaccumRobot`
   - **Pass:** `Vaccum@12345`
4. Click **Connect**. (These will be saved in your browser's localStorage for next time).

## MQTT Topic Reference

All communication happens under the `vacbot/` prefix:

| Topic | Direction | Payload Example | Description |
| :--- | :--- | :--- | :--- |
| `vacbot/cmd/movement` | ⬇️ Dash -> Robot | `FORWARD`, `STOP` | Manual drive commands |
| `vacbot/cmd/suction` | ⬇️ Dash -> Robot | `160`, `255` | 0-255 manual vacuum speed |
| `vacbot/cmd/mode` | ⬇️ Dash -> Robot | `AUTO`, `MANUAL` | Mode toggle |
| `vacbot/status/battery` | ⬆️ Robot -> Dash | `{"voltage":"11.5","percent":85,"health":"GOOD","alert":false}` | Battery telemetry |
| `vacbot/status/distance` | ⬆️ Robot -> Dash | `{"cm":120,"obstacle":false}` | Front sonar distance |
| `vacbot/status/mode` | ⬆️ Robot -> Dash | `AUTO`, `MANUAL` | Mode confirmation |
| `vacbot/status/auto` | ⬆️ Robot -> Dash | `{"state":"MOVING_FORWARD","row":1,"yaw":0,...}` | Auto cleaning state |
| `vacbot/status/online` | ⬆️ Robot -> Dash | `online`, `offline` | Robot LWT (Last Will) status |

## Auto Mode Tuning

You can adjust how the robot cleans your room by modifying these values in the `CONFIG` block:
- **`ROW_LENGTH_CM`**: The distance the robot drives forward in a straight line before turning.
- **`ROW_WIDTH_CM`**: The sideways distance the robot shifts over before starting the next row.
- **`MAX_ROWS`**: The total number of rows to complete before finishing.

## Troubleshooting

- **Robot turns too much/little:** The gyro sign might be wrong or biased. Re-run calibration by resetting the ESP32 on a completely flat surface.
- **MPU not found:** The LED will blink red. Check your I2C wiring on GPIO 8 (SDA) and 9 (SCL).
- **MQTT not connecting:** LED stays blue. Check your WiFi signal strength and ensure your SSID/Password are correct in the firmware config.
- **Vacuum not spinning:** Ensure the TB6612FNG STBY pin is tied to 3.3V and that the `PIN_VAC_PWM` (38) wiring is correct.
