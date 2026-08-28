/**
 * YWCA School - ZKTeco K40 Local Sync Bridge Agent
 * 
 * Runs on a school PC connected to the same LAN / WiFi as the ZKTeco K40 device.
 * Polls or listens for punches and syncs them directly to the Next.js cloud server.
 */

const ZKLib = require('node-zklib');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ⚙️ Configuration
const CONFIG = {
  // Device IP on local LAN
  deviceIp: process.env.DEVICE_IP || '192.168.1.201',
  devicePort: parseInt(process.env.DEVICE_PORT || '4370', 10),
  // Next.js Cloud Server Webhook Endpoint
  cloudApiUrl: process.env.CLOUD_API_URL || 'https://ywca.codenextit.com/api/attendance/sync',
  bridgeSecretToken: process.env.BRIDGE_SECRET_TOKEN || 'ywca_zkteco_k40_bridge_sync_token_secret_9988',
  // Sync interval in seconds
  pollIntervalSec: parseInt(process.env.POLL_INTERVAL_SEC || '10', 10),
  // Offline cache file
  cacheFile: path.join(__dirname, 'offline_punches.json'),
};

const zk = new ZKLib(CONFIG.deviceIp, CONFIG.devicePort, 10000, 4000);
let lastProcessedTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // Lookback 24h on start

function loadOfflineCache() {
  try {
    if (fs.existsSync(CONFIG.cacheFile)) {
      const data = fs.readFileSync(CONFIG.cacheFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading offline cache:', err.message);
  }
  return [];
}

function saveOfflineCache(punches) {
  try {
    fs.writeFileSync(CONFIG.cacheFile, JSON.stringify(punches, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing offline cache:', err.message);
  }
}

async function sendPunchesToCloud(punches) {
  if (!punches || punches.length === 0) return true;

  try {
    console.log(`📡 Sending ${punches.length} punch(es) to Cloud server (${CONFIG.cloudApiUrl})...`);
    const response = await axios.post(
      CONFIG.cloudApiUrl,
      { punches },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-bridge-token': CONFIG.bridgeSecretToken,
        },
        timeout: 15000,
      }
    );

    if (response.data && response.data.success) {
      console.log(`✅ Successfully synced ${punches.length} punch(es)!`);
      return true;
    } else {
      console.error('⚠️ Cloud server returned error:', response.data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Cloud Sync Failed (${error.message}). Saving to offline cache.`);
    return false;
  }
}

async function runBridge() {
  console.log('=====================================================');
  console.log('  YWCA Nursery School - ZKTeco K40 Sync Bridge v1.0  ');
  console.log(`  Device: ${CONFIG.deviceIp}:${CONFIG.devicePort}`);
  console.log(`  Cloud URL: ${CONFIG.cloudApiUrl}`);
  console.log('=====================================================');

  // 1. Flush offline cache if any
  let offlineCache = loadOfflineCache();
  if (offlineCache.length > 0) {
    console.log(`🔄 Found ${offlineCache.length} cached offline punch(es). Attempting to upload...`);
    const sent = await sendPunchesToCloud(offlineCache);
    if (sent) {
      offlineCache = [];
      saveOfflineCache(offlineCache);
    }
  }

  // 2. Main sync loop
  setInterval(async () => {
    try {
      // Connect to K40 device
      await zk.createSocket();
      console.log(`[${new Date().toLocaleTimeString()}] 🔌 Connected to ZKTeco K40 device.`);

      // Read Attendance Logs
      const logs = await zk.getAttendances();
      if (logs && logs.data && logs.data.length > 0) {
        // Filter punches newer than lastProcessedTime
        const newPunches = logs.data
          .filter((item) => {
            const punchDate = new Date(item.recordTime);
            return punchDate > lastProcessedTime;
          })
          .map((item) => ({
            userId: String(item.deviceUserId),
            timestamp: new Date(item.recordTime).toISOString(),
            verifyMode: item.ip ? 1 : 1,
          }));

        if (newPunches.length > 0) {
          console.log(`🎯 Found ${newPunches.length} new punch(es) on device.`);
          const sent = await sendPunchesToCloud(newPunches);
          if (sent) {
            lastProcessedTime = new Date();
          } else {
            // Add to offline cache
            offlineCache = [...offlineCache, ...newPunches];
            saveOfflineCache(offlineCache);
          }
        }
      }

      // Disconnect socket cleanly
      await zk.disconnect();
    } catch (err) {
      console.error(`[${new Date().toLocaleTimeString()}] ⚠️ Device connection error: ${err.message}`);
      try {
        await zk.disconnect();
      } catch {}
    }
  }, CONFIG.pollIntervalSec * 1000);
}

runBridge().catch((err) => console.error('Fatal bridge error:', err));

