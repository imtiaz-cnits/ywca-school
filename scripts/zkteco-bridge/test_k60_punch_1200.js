/**
 * Safe Isolated Test Script for ZKTeco K60 - User ID 1200
 * 
 * Safely inspects or sends ONLY the latest punch for User ID 1200 to the LOCAL development server.
 * 
 * Strict Safety Guarantees:
 * 1. Strictly locked to localhost/127.0.0.1 (any external/production URL immediately aborts execution).
 * 2. Mandatory environment variable authentication (zero hardcoded fallback secrets).
 * 3. Zero touch to historical backup archives.
 * 4. Zero deletion or modification of K60 device logs or settings.
 * 5. Never syncs any other user's historical records.
 * 
 * Usage:
 *   node scripts/zkteco-bridge/test_k60_punch_1200.js --dry-run   (Only inspect without sending)
 *   node scripts/zkteco-bridge/test_k60_punch_1200.js --sync      (Send only the single 1200 punch to local API)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const ZKLib = require('node-zklib');
const axios = require('axios');
const { serializeDeviceRecordTimeToDhakaIso } = require('./bridge');

/**
 * Strict Localhost Guard: Enforces that the target API endpoint MUST be localhost or 127.0.0.1.
 * Any external host or production domain will trigger an immediate abort.
 */
function resolveAndValidateLocalhostUrl(rawUrl) {
  const urlToTest = rawUrl || 'http://localhost:3000/api/attendance/sync';
  let parsed;
  try {
    parsed = new URL(urlToTest);
  } catch (err) {
    throw new Error(`Invalid Target URL format: "${urlToTest}"`);
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    throw new Error(
      `🚨 SAFETY VIOLATION: test_k60_punch_1200.js is strictly locked to localhost/127.0.0.1! Blocked external target: "${urlToTest}"`
    );
  }

  return urlToTest;
}

/**
 * Validates that the sync secret is provided exclusively via environment variables.
 * Hardcoded plain-text fallback strings are strictly disallowed.
 */
function getRequiredSecretToken() {
  const token = process.env.BIOMETRIC_SYNC_SECRET || process.env.BRIDGE_SECRET_TOKEN;
  if (!token || !token.trim()) {
    throw new Error(
      '❌ Configuration Error: BIOMETRIC_SYNC_SECRET environment variable is missing. Hardcoded fallback secrets are disabled.'
    );
  }
  return token.trim();
}

const CONFIG = {
  deviceIp: process.env.DEVICE_IP || '192.168.0.134',
  devicePort: parseInt(process.env.DEVICE_PORT || '4370', 10),
  targetApiUrl: resolveAndValidateLocalhostUrl(process.env.LOCAL_API_URL || process.env.CLOUD_API_URL),
  bridgeSecretToken: getRequiredSecretToken(),
  targetUserId: '1200',
};

async function main() {
  const isSync = process.argv.includes('--sync');
  const isDryRun = process.argv.includes('--dry-run') || !isSync;

  console.log('================================================================');
  console.log('  YWCA Nursery School - Safe K60 Isolated Punch Test (ID: 1200) ');
  console.log(`  Device: ${CONFIG.deviceIp}:${CONFIG.devicePort}`);
  console.log(`  Target API: ${CONFIG.targetApiUrl} [STRICT LOCALHOST ONLY]`);
  console.log(`  Mode: ${isSync ? '🚀 SYNC SINGLE PUNCH' : '🔍 DRY-RUN INSPECT ONLY'}`);
  console.log('================================================================');

  const zk = new ZKLib(CONFIG.deviceIp, CONFIG.devicePort, 10000, 4000);

  try {
    console.log(`🔌 Connecting to ZKTeco K60 at ${CONFIG.deviceIp}:${CONFIG.devicePort}...`);
    await zk.createSocket();
    console.log('✅ Connected successfully.');

    // Fetch device time
    try {
      const deviceTime = await zk.getTime();
      console.log(`⏰ Current K60 Internal Hardware Time: ${deviceTime}`);
    } catch {
      console.log('ℹ️ Could not query K60 hardware time directly; proceeding to read logs.');
    }

    console.log('📥 Reading attendance buffer from K60...');
    const logs = await zk.getAttendances();
    const allRecords = logs && logs.data ? logs.data : [];
    console.log(`📊 Total historical punch logs stored on K60: ${allRecords.length}`);

    // Disconnect socket immediately to free the hardware connection
    await zk.disconnect();
    console.log('🔌 K60 socket closed cleanly.');

    // Filter strictly for target user ID 1200
    const userPunches = allRecords.filter(
      (item) => String(item.deviceUserId).trim() === CONFIG.targetUserId
    );

    if (userPunches.length === 0) {
      console.log(`\n⚠️ No punch records found on K60 for User ID "${CONFIG.targetUserId}".`);
      console.log('👉 Please put your registered finger on the K60 sensor, wait for the confirmation beep, and run this test again.');
      return;
    }

    // Sort by recordTime descending (newest first)
    userPunches.sort((a, b) => new Date(b.recordTime).getTime() - new Date(a.recordTime).getTime());

    const latestPunch = userPunches[0];
    const isoDhaka = serializeDeviceRecordTimeToDhakaIso(latestPunch.recordTime);

    const punchPayload = {
      punches: [
        {
          userId: String(latestPunch.deviceUserId).trim(),
          timestamp: isoDhaka,
          verifyMode: 1,
        },
      ],
    };

    console.log(`\n🎯 Found ${userPunches.length} total punch(es) for User ID "${CONFIG.targetUserId}".`);
    console.log('----------------------------------------------------------------');
    console.log(`  Latest Punch Details:`);
    console.log(`  - Device User ID : ${latestPunch.deviceUserId}`);
    console.log(`  - Raw Record Time: ${latestPunch.recordTime}`);
    console.log(`  - Asia/Dhaka ISO : ${isoDhaka}`);
    console.log(`  - Verify Mode    : 1 (Numeric Integer)`);
    console.log('----------------------------------------------------------------');
    console.log(`  Constructed Sync Payload:`);
    console.log(JSON.stringify(punchPayload, null, 2));
    console.log('----------------------------------------------------------------');

    if (isDryRun) {
      console.log('\n🔍 DRY-RUN COMPLETE: No data was sent to the server.');
      console.log('💡 To send ONLY this single punch to the local API, run:');
      console.log('   node scripts/zkteco-bridge/test_k60_punch_1200.js --sync');
      return;
    }

    // Send ONLY this single punch to the local API
    console.log(`\n📡 Posting single punch to ${CONFIG.targetApiUrl}...`);

    const response = await axios.post(CONFIG.targetApiUrl, punchPayload, {
      headers: {
        'Content-Type': 'application/json',
        'x-bridge-token': CONFIG.bridgeSecretToken,
      },
      timeout: 10000,
    });

    console.log('\n🎉 API Response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    try {
      await zk.disconnect();
    } catch {}
  }
}

module.exports = {
  resolveAndValidateLocalhostUrl,
  getRequiredSecretToken,
};

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(`Fatal safety error: ${err.message}`);
    process.exit(1);
  }
}
