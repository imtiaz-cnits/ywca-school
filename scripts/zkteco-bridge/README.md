# ZKTeco K60 Local Sync Bridge Agent (YWCA Nursery School)

This lightweight agent runs on a local desktop/laptop at the school premises that is connected to the same LAN / WiFi router as the **ZKTeco K60** biometric machine.

---

## 🚀 Quick Setup Instructions

### 1. Requirements
* Node.js (v18 or higher) installed on the school PC.
* Physical ZKTeco K60 connected to the local WiFi or Ethernet cable.

### 2. Configure Device IP
Set static IP in ZKTeco K60:
* Menu $\rightarrow$ Comm. $\rightarrow$ Network:
  * IP Address: `192.168.0.134` (or your local device IP)
  * Port: `4370`

### 3. Run Sync Bridge
Open command prompt inside this folder:

```bash
# 1. Install dependencies
npm install

# 2. Run the bridge
node bridge.js
```

---

## 🛠️ Running Automatically on Windows Startup
To make it run silently in the background on Windows startup:
1. Install `pm2`:
   ```bash
   npm install -g pm2
   npm install -g pm2-windows-startup
   pm2-startup install
   ```
2. Start the bridge:
   ```bash
   pm2 start bridge.js --name "zkteco-bridge"
   pm2 save
   ```
Now the bridge will automatically run in the background whenever the computer starts.

