# 🤖 VacBot — Autonomous Vacuum Robot

Welcome to the VacBot project! This guide explains how to set up the hardware, flash the firmware, run the simulator, and use the web dashboard.

**Latest Updates (v1.1)**:
- ⚡ **Battery threshold optimized**: Now operates until 7V (was 9V) for longer runtime during peak load
- 🎯 **Faster obstacle detection**: Sonar polling increased to 30ms (was 100ms) for real-time responsiveness  
- 🛡️ **Continuous safety monitoring**: New obstacle detection during movement prevents collisions in both MANUAL and AUTO modes
- 🎨 **Redesigned dashboard**: VacuumControl and ArrowNavigation now displayed side-by-side (matching SLAM+Radar layout)

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

1. Open the dashboard by navigating to the `dashboard` folder and running `npm install` then `npm run dev` or `npm run build`.
2. For production, open the built `index.html` in your web browser.
3. Click the connection icon to configure MQTT settings:
   - **Host:** `0808028e417c4ff2957842f563dafe7b.s1.eu.hivemq.cloud`
   - **Port:** `8884` (for secure WebSockets)
   - **User:** `VaccumRobot`
   - **Pass:** `Vaccum@12345`
4. Click **Connect**. (Credentials are saved in localStorage for future sessions).

### Dashboard Layout

The dashboard is organized in a professional 3-column mission control layout:

**Desktop (1200px+)**:
- **Left Panel**: Battery status, sensor readings (Front/Left/Right ultrasonic), wheel encoder metrics, AI decision log
- **Center Panel** (flex):
  - **Top**: Real-time SLAM map (dead-reckoning visualization) + 180° radar with live obstacle dots
  - **Bottom**: Arrow navigation controls (4-directional) + Vacuum control (slider + presets) displayed side-by-side
- **Right Panel**: Mission status (current row, coverage %, ETA), mode selector, heartbeat metrics

**Tablet (768-1199px)**: Center panel remains full-width, left/right panels stack below

**Mobile (<768px)**: Single column layout with all components stacked vertically

### Dashboard Features

- **Real-time SLAM Map**: Canvas visualization showing robot position, path history, obstacle positions, and movement trends
- **Live Radar**: SVG 180° radar displaying front/left/right sensor distances with safe direction indicators
- **Arrow Navigation**: 4-directional movement control with keyboard support (↑↓←→ or WASD) and touch support
- **Vacuum Control**: Suction slider (0-255) with ECO/NORM/MAX preset buttons, auto-disabled in AUTO mode
- **Battery Monitoring**: Live voltage, percentage, health status (EXCELLENT/GOOD/FAIR/LOW/CRITICAL) with color-coded indicator
- **Mode Toggle**: Switch between MANUAL and AUTO cleaning modes
- **Live Telemetry**: Real-time sonar readings, gyro heading, encoder distances, and navigation guidance

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
- **`BATTERY_MIN_V`** (7.0V): Minimum voltage threshold. Robot allows operation down to 7V for longer cleaning sessions during high power draw (motors + vacuum together).
- **`OBSTACLE_CM`** (15): Front sonar distance threshold for obstacle detection.
- **`FRONT_STOP_CM`** (9): Emergency stop distance in AUTO mode.
- **`SIDE_CLEAR_CM`** (7): Minimum safe distance for left/right obstacle clearance.

## Firmware Features

### Enhanced Obstacle Detection (v1.1)

The firmware now implements **real-time continuous obstacle monitoring** for safer autonomous and manual operation:

- **30ms Sonar Polling**: All 3 ultrasonic sensors (front/left/right) are read every 30ms instead of 100ms, providing faster response times
- **MANUAL Mode Safety**: If front sonar detects obstacle within `OBSTACLE_CM` (15cm), forward movement is blocked immediately
- **AUTO Mode Predictive Avoidance**: 
  - If robot is approaching obstacle (distance decreasing) at <35cm, predictive turn is triggered
  - Emergency stop at <9cm critical distance
  - Smart turn direction selection (turns toward clearer side)
- **Continuous Monitoring**: `checkObstaclesWhileMoving()` function runs every loop iteration, catching obstacles even between state machine updates
- **Safe Directions Guidance**: Publishes real-time safe movement directions (FORWARD, LEFT, RIGHT, BACKWARD, STOP) to dashboard

### Battery Management (v1.1)

- **Optimized Voltage Threshold**: `BATTERY_MIN_V` set to 7.0V (was 9.0V), allowing extended runtime during high power draw
- **Smart Vacuum Speed Control**: Auto-adjusts vacuum speed based on battery level (TURBO at >70%, ECO at ≤70%)
- **Health Status Indicators**:
  - **EXCELLENT**: ≥95% charge
  - **GOOD**: 75-95%
  - **FAIR**: 50-75%
  - **LOW**: 25-50% (pulse animation on dashboard)
  - **CRITICAL**: <25% (emergency shutdown)
- **Peak Load Handling**: When fan + motors run simultaneously, system maintains operation until 7V instead of cutting out at 9.2V

### Telemetry Publishing

The firmware publishes rich telemetry data every 30-2000ms to the MQTT broker for dashboard visualization and logging:
- **Sonar data**: Front, left, right distances (every 30ms)
- **Navigation guidance**: Safe directions, approach detection, distance trend
- **Battery**: Voltage, percentage, health, alert status (every 2s)
- **Auto mode status**: State, row number, yaw angle, encoder distances, coverage % (every 1s)

## Troubleshooting

- **Robot stops prematurely (9.2V alert):** This was the expected behavior at BATTERY_MIN_V=9.0V. Updated to 7.0V in v1.1 for longer runtime. If you're still seeing early shutdowns, check for excessive draw (motors stalling, vacuum jamming).
  
- **Robot collides with obstacles:** Verify sonar sensors are wired correctly (GPIO 11/12/13 for echo pins). Test with serial monitor to confirm readings. If sonar reads are >200cm or flat, sensors may be damaged or misaligned.

- **Robot turns too much/little:** The gyro sign might be wrong or biased. Re-run calibration by resetting the ESP32 on a completely flat surface.

- **MPU not found:** The LED will blink red. Check your I2C wiring on GPIO 8 (SDA) and 9 (SCL).

- **MQTT not connecting:** LED stays blue. Check your WiFi signal strength and ensure your SSID/Password are correct in the firmware config. For TLS certificate issues, the firmware will fall back to insecure mode automatically.

- **Vacuum not spinning:** Ensure the TB6612FNG STBY pin is tied to 3.3V and that the `PIN_VAC_PWM` (38) wiring is correct. Test with dashboard slider.

- **Dashboard not updating:** Verify MQTT connection status in the dashboard header. Check that robot is online and subscribed to correct topics. Browser console (F12) may show WebSocket errors.

- **Obstacle detection not responsive:** Check sonar polling frequency in serial monitor (should show new readings every 30ms). If sonar readings are noisy, try adding a 100nF capacitor across the sensor VCC/GND pins.

## Changelog

### v1.1 (Current)
**Firmware Improvements**:
- Reduced sonar polling interval from 100ms → 30ms for real-time obstacle detection
- Added `checkObstaclesWhileMoving()` for continuous safety monitoring during movement
- BATTERY_MIN_V threshold adjusted from 9.0V → 7.0V to support extended runtime during peak load (motors + vacuum)
- Improved AUTO mode predictive avoidance with approach detection
- Enhanced MANUAL mode with immediate obstacle blocking

**Dashboard Enhancements**:
- Separated VacuumControl from ArrowNavigation component for better UI hierarchy
- Implemented side-by-side layout for arrow navigation + vacuum control (matching SLAM + Radar layout)
- Improved responsive breakpoints and mobile layout
- Added real-time navigation guidance (safe directions indicator)
- Enhanced visual consistency across all components

### v1.0 (Initial Release)
- Complete autonomous vacuum robot firmware with WiFi + MQTT connectivity
- 3x ultrasonic sensor obstacle detection and avoidance
- Real-time SLAM map visualization on React dashboard
- Dual H-bridge motor control with encoder feedback
- MPU6050 gyroscope-based heading tracking
- Professional mission control dashboard with 3-column layout
