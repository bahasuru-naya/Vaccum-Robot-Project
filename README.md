# VacBot Dashboard

This repository contains the VacBot dashboard web application only.

The dashboard is a React app located in the `dashboard/` folder and communicates with the robot via MQTT.

## Local setup

### 1. Install dependencies
```bash
cd dashboard
npm install
```

### 2. Run locally
```bash
npm start
```

Open the app at `http://localhost:3000`.

### 3. Build for production
```bash
npm run build
```

Production files are generated in `dashboard/build`.

## Project structure

- `dashboard/src` — React application source code
- `dashboard/public` — static public assets
- `dashboard/package.json` — scripts and dependencies
- `dashboard/build` — generated production output

## Environment configuration

The dashboard uses CRA environment variables with the `REACT_APP_` prefix.
Create a `.env` file in `dashboard/` if needed:

```env
REACT_APP_MQTT_HOST=0808028e417c4ff2957842f563dafe7b.s1.eu.hivemq.cloud
REACT_APP_MQTT_PORT=8884
REACT_APP_MQTT_USERNAME=VaccumRobot
REACT_APP_MQTT_PASSWORD=Vaccum@12345
REACT_APP_MQTT_TOPIC_PREFIX=vacbot
```

## MQTT topic reference

The dashboard expects MQTT topics under the `vacbot/` prefix:

| Topic | Direction | Description |
| :--- | :--- | :--- |
| `vacbot/cmd/movement` | Dash → Robot | Manual movement commands |
| `vacbot/cmd/suction` | Dash → Robot | Vacuum speed command |
| `vacbot/cmd/mode` | Dash → Robot | Mode switch command |
| `vacbot/status/battery` | Robot → Dash | Battery telemetry |
| `vacbot/status/distance` | Robot → Dash | Front distance telemetry |
| `vacbot/status/mode` | Robot → Dash | Current robot mode |
| `vacbot/status/auto` | Robot → Dash | Auto mode state and telemetry |
| `vacbot/status/online` | Robot → Dash | Robot online/offline status |

## Deployment

For Vercel, configure the dashboard project as follows:
- Root directory: `dashboard`
- Build command: `npm run build`
- Output directory: `build`

## Notes

- This README is focused only on the dashboard application.
- Hardware, firmware, and simulator details are intentionally excluded.
