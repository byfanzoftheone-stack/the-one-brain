# Nervous System
**Real-time IoT & Fleet Monitoring with Autonomous Agent Response**

The Nervous System connects physical assets (trucks, sensors, equipment) to an AI brain that detects problems and dispatches fixes automatically — no human required.

## Architecture
- **Ears** (FastAPI): Receives signals from trucks, sensors, software
- **Spine** (Redis): Zero-latency queue — nothing is lost
- **Brain** (Worker Agents): Strategist + Debugger wake up on signals
- **Hands** (Override API): Deploys patches and reroutes automatically

## Use Cases
- Fleet management & logistics
- Field service equipment monitoring
- Cold chain / temperature-sensitive cargo
- Software service health monitoring

## Pricing
$149/month — includes up to 50 monitored units

## Deploy
```bash
docker-compose up --build
```
