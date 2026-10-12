/**
 * YWCA Nursery School - ZKTeco K60 / K40 Biometric Sync Bridge Agent
 * 
 * Runs on a school desktop/PC connected to the same LAN / WiFi as the physical ZKTeco device.
 * Polls the device for new attendance punches and securely syncs them to the Next.js API.
 * 
 * Production & Safety Guarantees:
 * 1. Persistent State (bridge_state.json): Tracks last processed punch time across reboots
 *    using crash-safe atomic file replacement.
 * 2. In-Loop Offline Queue Auto-Flush (offline_punches.json): Retries queued punches automatically
 *    during recurring poll cycles, preserves partial failures, and maintains strict chronological order.
 * 3. Explicit External Endpoint Approval: Restricts to localhost by default; blocks non-localhost
 *    URLs unless ALLOW_EXTERNAL_API=true is explicitly configured. Never silently falls back to production.
 * 4. Fail-Safe Authentication: Requires BIOMETRIC_SYNC_SECRET from environment/.env.
 * 5. Type-Safe Payloads: Guarantees verifyMode is always an integer.
 * 6. Concurrency Guard: Prevents overlapping polling cycles on port 4370.
 */

const path = require('path');
// Load .env from project root or local directory
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '.env') });

const ZKLib = require('node-zklib');
const axios = require('axios');
const fs = require('fs');

const STATE_FILE = path.join(__dirname, 'bridge_state.json');
const CACHE_FILE = path.join(__dirname, 'offline_punches.json');

/**
 * Validates target API endpoint.
 * Strict Rule: Only localhost/127.0.0.1 permitted by default.
 * External URLs require explicit ALLOW_EXTERNAL_API=true.
 */
function validateTargetUrl(rawUrl, allowExternal = false) {
  const urlToTest = rawUrl || 'http://localhost:3000/api/attendance/sync';
  let parsed;
  try {
    parsed = new URL(urlToTest);
  } catch (err) {
    throw new Error(`Invalid Target API URL format: "${urlToTest}"`);
  }

  const hostname = parsed.hostname.toLowerCase();
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  if (!isLocalhost && !allowExternal) {
    throw new Error(
      `🚨 SAFETY VIOLATION: External target API "${urlToTest}" is blocked! External endpoints require explicit ALLOW_EXTERNAL_API=true.`
    );
  }

  return urlToTest;
}

/**
 * Validates and returns the active configuration
 */
function getBridgeConfig() {
  const secret = process.env.BIOMETRIC_SYNC_SECRET || process.env.BRIDGE_SECRET_TOKEN;
  if (!secret || !secret.trim()) {
    throw new Error(
      '❌ Configuration Error: BIOMETRIC_SYNC_SECRET environment variable is missing. Set it in .env or environment.'
    );
  }

  const allowExternal = process.env.ALLOW_EXTERNAL_API === 'true';

  // Determine raw endpoint
  let rawEndpoint = process.env.CLOUD_API_URL;
  if (!rawEndpoint) {
    if (process.env.NEXT_PUBLIC_APP_URL) {
      try {
        const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL);
        const host = appUrl.hostname.toLowerCase();
        if (host === 'localhost' || host === '127.0.0.1' || allowExternal) {
          rawEndpoint = `${process.env.NEXT_PUBLIC_APP_URL}/api/attendance/sync`;
        }
      } catch {}
    }
  }

  const validatedUrl = validateTargetUrl(rawEndpoint || 'http://localhost:3000/api/attendance/sync', allowExternal);

  return {
    deviceIp: process.env.DEVICE_IP || '192.168.0.134',
    devicePort: parseInt(process.env.DEVICE_PORT || '4370', 10),
    cloudApiUrl: validatedUrl,
    bridgeSecretToken: secret.trim(),
    pollIntervalSec: parseInt(process.env.POLL_INTERVAL_SEC || '10', 10),
    allowExternalApi: allowExternal,
    stateFile: STATE_FILE,
    cacheFile: CACHE_FILE,
  };
}

/**
 * Writes JSON file atomically via temporary file replacement to avoid corruption on abrupt crash.
 */
function atomicWriteJson(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch {}
    throw err;
  }
}

/**
 * Deduplicates an array of punch objects by userId and timestamp, sorting chronologically ascending.
 */
function deduplicateAndSortPunches(punches) {
  if (!Array.isArray(punches)) return [];
  const seen = new Set();
  const result = [];

  for (const p of punches) {
    if (!p || !p.userId || !p.timestamp) continue;
    const key = `${String(p.userId).trim()}_${String(p.timestamp).trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({
        userId: String(p.userId).trim(),
        timestamp: String(p.timestamp).trim(),
        verifyMode: typeof p.verifyMode === 'number' ? p.verifyMode : 1,
      });
    }
  }

  result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return result;
}

/**
 * Serializes node-zklib recordTime to explicit Asia/Dhaka (+06:00) ISO string.
 * Extracts local date getters from the K60 wall-clock numbers.
 */
function serializeDeviceRecordTimeToDhakaIso(recordTime) {
  const d = recordTime instanceof Date ? recordTime : new Date(recordTime);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+06:00`;
}

/**
 * Safely formats any error (ZKError, Error, string, object, or rejected promise)
 * into a clear diagnostic string without leaking secrets or biometric data.
 * 
 * Note on node-zklib: ZKError does not extend Error and has no .message property.
 * Instead, the underlying system/socket error is in .err (with .code, .message),
 * and .command / .ip contain the failing operation and device target.
 */
function formatDiagnosticError(err, secretToRedact = '') {
  if (err === null || err === undefined) {
    return 'Unknown error (null or undefined)';
  }

  let summary = '';
  let code = '';
  let command = '';
  let ip = '';

  // node-zklib ZKError detection
  if (typeof err === 'object' && ('command' in err || 'err' in err)) {
    command = err.command ? ` [Command: ${err.command}]` : '';
    ip = err.ip ? ` [Device: ${err.ip}]` : '';

    const inner = err.err;
    if (inner instanceof Error) {
      summary = inner.message;
      code = inner.code || '';
    } else if (typeof inner === 'string') {
      summary = inner;
    } else if (inner && typeof inner === 'object') {
      summary = inner.message || inner.code || JSON.stringify(inner);
      code = inner.code || '';
    } else if (typeof err.toast === 'function') {
      try {
        summary = err.toast();
      } catch {}
    }

    if (!summary) summary = 'Connection or communication error';
  } else if (err instanceof Error) {
    summary = `${err.name}: ${err.message}`;
    code = err.code || '';
  } else if (typeof err === 'string') {
    summary = err;
  } else if (typeof err === 'object') {
    try {
      summary = err.message || JSON.stringify(err);
      code = err.code || '';
    } catch {
      summary = String(err);
    }
  } else {
    summary = String(err);
  }

  const codeStr = code ? ` (code: ${code})` : '';
  let result = (command || ip) ? `ZKError${command}${ip}: ${summary}${codeStr}` : `${summary}${codeStr}`;

  // Safe redaction of secret tokens
  if (secretToRedact && typeof secretToRedact === 'string' && secretToRedact.length > 0) {
    result = result.split(secretToRedact).join('[REDACTED_SECRET]');
  }

  return result;
}

/**
 * Safely extracts attendance records array from node-zklib getAttendances() return value.
 * node-zklib getAttendances() returns an object: { data: Array<Record>, err: Error|null }.
 */
function extractAttendanceRecords(logs) {
  if (!logs) return [];
  if (Array.isArray(logs.data)) return logs.data;
  if (Array.isArray(logs)) return logs;
  return [];
}

/**
 * Loads the persistent bridge state from bridge_state.json.
 * If no state exists, returns null.
 */
function loadBridgeState(filePath = STATE_FILE) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('⚠️ Error reading bridge state file:', err.message);
  }
  return null;
}

/**
 * Persists the latest synced state to disk atomically.
 */
function saveBridgeState(state, filePath = STATE_FILE) {
  try {
    atomicWriteJson(filePath, state);
  } catch (err) {
    console.error('⚠️ Error saving bridge state file:', err.message);
  }
}

/**
 * Loads offline cached punches.
 */
function loadOfflineCache(filePath = CACHE_FILE) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? deduplicateAndSortPunches(parsed) : [];
    }
  } catch (err) {
    console.error('⚠️ Error reading offline cache:', err.message);
  }
  return [];
}

/**
 * Saves offline punches to disk atomically.
 */
function saveOfflineCache(punches, filePath = CACHE_FILE) {
  try {
    const sorted = deduplicateAndSortPunches(punches);
    atomicWriteJson(filePath, sorted);
  } catch (err) {
    console.error('⚠️ Error writing offline cache:', err.message);
  }
}

/**
 * Posts an array of punches to the Attendance Sync API.
 * Handles partial failures by isolating and returning only unprocessed/failed punches.
 */
async function sendPunchesToCloud(punches, config = null) {
  if (!punches || punches.length === 0) {
    return { success: true, remainingPunches: [] };
  }
  const cfg = config || getBridgeConfig();

  try {
    console.log(`📡 Sending ${punches.length} punch(es) to server (${cfg.cloudApiUrl})...`);
    const response = await axios.post(
      cfg.cloudApiUrl,
      { punches },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-bridge-token': cfg.bridgeSecretToken,
        },
        timeout: 15000,
      }
    );

    if (response.data && response.data.success) {
      const serverErrors = response.data.errors;

      // Handle Partial Failure: isolate punches that failed processing on server
      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        console.warn(`⚠️ Partial server sync: ${punches.length - serverErrors.length} processed, ${serverErrors.length} failed.`);
        const failedKeySet = new Set(
          serverErrors
            .filter((e) => e && e.punch)
            .map((e) => `${String(e.punch.userId).trim()}_${String(e.punch.timestamp).trim()}`)
        );
        const remaining = punches.filter((p) => failedKeySet.has(`${p.userId}_${p.timestamp}`));
        return { success: false, partial: true, remainingPunches: remaining };
      }

      console.log(`✅ Successfully synced ${punches.length} punch(es)! (Server: ${response.data.message || 'OK'})`);
      return { success: true, remainingPunches: [] };
    } else {
      console.error('⚠️ Server returned error status:', response.data);
      return { success: false, remainingPunches: punches };
    }
  } catch (error) {
    console.error(`❌ Cloud Sync Failed (${error.message}). Preserving in offline queue.`);
    return { success: false, remainingPunches: punches };
  }
}

// Concurrency lock for offline queue flushes
let isFlushingQueue = false;

/**
 * Retries and flushes pending offline queue.
 * Returns true if the queue is empty or successfully uploaded; false if items remain.
 */
async function flushOfflineQueue(config) {
  if (isFlushingQueue) return false;
  isFlushingQueue = true;

  try {
    const queue = loadOfflineCache(config.cacheFile);
    if (!queue || queue.length === 0) return true;

    console.log(`🔄 Attempting to flush ${queue.length} pending offline punch(es)...`);
    const result = await sendPunchesToCloud(queue, config);

    if (result.success) {
      saveOfflineCache([], config.cacheFile);
      console.log('✅ Offline queue fully flushed and cleared.');
      return true;
    } else {
      // Save only remaining/failed punches to prevent queue loss
      saveOfflineCache(result.remainingPunches, config.cacheFile);
      console.warn(`⚠️ Offline queue flush incomplete. ${result.remainingPunches.length} punch(es) remain queued.`);
      return false;
    }
  } finally {
    isFlushingQueue = false;
  }
}

/**
 * Main Bridge Daemon Process
 */
async function runBridge() {
  const config = getBridgeConfig();

  console.log('================================================================');
  console.log('   YWCA Nursery School - ZKTeco Biometric Sync Bridge Daemon    ');
  console.log(`   Device Target : ${config.deviceIp}:${config.devicePort}`);
  console.log(`   Sync Endpoint : ${config.cloudApiUrl} ${config.allowExternalApi ? '[EXTERNAL APPROVED]' : '[LOCAL ONLY]'}`);
  console.log(`   Poll Interval : ${config.pollIntervalSec}s`);
  console.log('================================================================');

  // Initialize or restore state
  let state = loadBridgeState(config.stateFile);
  let lastProcessedTime;

  if (state && state.lastProcessedIso) {
    lastProcessedTime = new Date(state.lastProcessedIso);
    console.log(`📂 Resumed state from bridge_state.json: Last synced punch at ${state.lastProcessedIso}`);
  } else {
    // Fresh start: Default to NOW to protect against historical log backfill
    lastProcessedTime = new Date();
    state = {
      lastProcessedIso: lastProcessedTime.toISOString(),
      lastSyncAt: new Date().toISOString(),
      totalSyncedCount: 0,
      initializedAt: new Date().toISOString(),
    };
    saveBridgeState(state, config.stateFile);
    console.log(`🆕 Initialized new bridge state. Monitoring punches created AFTER: ${state.lastProcessedIso}`);
  }

  // Initial startup flush of offline queue
  await flushOfflineQueue(config);

  let isPolling = false;

  async function pollCycle() {
    if (isPolling) return;
    isPolling = true;
    let zk = null;

    try {
      // 1. In-loop auto-flush: Always attempt to flush any pending offline queue first
      const pendingBefore = loadOfflineCache(config.cacheFile);
      if (pendingBefore.length > 0) {
        await flushOfflineQueue(config);
      }

      // 2. Instantiate fresh ZKLib per polling cycle to guarantee clean socket lifecycle
      zk = new ZKLib(config.deviceIp, config.devicePort, 10000, 4000);
      await zk.createSocket();
      const logs = await zk.getAttendances();
      const allRecords = extractAttendanceRecords(logs);

      // Filter punches strictly newer than lastProcessedTime
      const newRecords = allRecords.filter((item) => {
        const punchDate = new Date(item.recordTime);
        return punchDate.getTime() > lastProcessedTime.getTime();
      });

      if (newRecords.length > 0) {
        // Sort ascending so we process chronologically
        newRecords.sort((a, b) => new Date(a.recordTime).getTime() - new Date(b.recordTime).getTime());

        const punchesPayload = newRecords.map((item) => ({
          userId: String(item.deviceUserId).trim(),
          timestamp: serializeDeviceRecordTimeToDhakaIso(item.recordTime),
          verifyMode: 1, // Integer verifyMode
        }));

        // Check if there is still an unresolved offline queue:
        const remainingQueue = loadOfflineCache(config.cacheFile);
        if (remainingQueue.length > 0) {
          // If offline queue has pending punches, append new punches to queue
          // to preserve chronological order without skipping earlier punches!
          const combined = deduplicateAndSortPunches([...remainingQueue, ...punchesPayload]);
          saveOfflineCache(combined, config.cacheFile);
          console.log(`📦 Appended ${punchesPayload.length} new punch(es) to offline queue (Total queued: ${combined.length}).`);
        } else {
          // Normal online path: Send directly
          console.log(`\n🎯 Detected ${punchesPayload.length} new punch(es) on device.`);
          const result = await sendPunchesToCloud(punchesPayload, config);

          if (result.success) {
            // Update lastProcessedTime to the newest punch in this batch
            const newestRecord = newRecords[newRecords.length - 1];
            const newestDhakaIso = serializeDeviceRecordTimeToDhakaIso(newestRecord.recordTime);
            lastProcessedTime = new Date(newestRecord.recordTime);

            state.lastProcessedIso = newestDhakaIso;
            state.lastSyncAt = new Date().toISOString();
            state.totalSyncedCount = (state.totalSyncedCount || 0) + punchesPayload.length;
            saveBridgeState(state, config.stateFile);
          } else {
            // Append failed/remaining punches to offline cache
            saveOfflineCache(result.remainingPunches, config.cacheFile);
          }
        }
      }
    } catch (err) {
      const diagMsg = formatDiagnosticError(err, config.bridgeSecretToken);
      console.error(`[${new Date().toLocaleTimeString()}] ⚠️ Device poll error: ${diagMsg}`);
    } finally {
      if (zk) {
        try {
          await zk.disconnect();
        } catch {}
        // Defensive cleanup: Ensure socket references are cleared
        try {
          if (zk.zklibTcp && zk.zklibTcp.socket) {
            zk.zklibTcp.socket.destroy();
            zk.zklibTcp.socket = null;
          }
          if (zk.zklibUdp && zk.zklibUdp.socket) {
            zk.zklibUdp.socket.close();
            zk.zklibUdp.socket = null;
          }
        } catch {}
        zk = null;
      }
      isPolling = false;
    }
  }

  // Schedule recurring poll cycle safely
  setInterval(pollCycle, config.pollIntervalSec * 1000);
  // Run first cycle immediately
  pollCycle();
}

module.exports = {
  getBridgeConfig,
  validateTargetUrl,
  atomicWriteJson,
  deduplicateAndSortPunches,
  serializeDeviceRecordTimeToDhakaIso,
  formatDiagnosticError,
  extractAttendanceRecords,
  loadBridgeState,
  saveBridgeState,
  loadOfflineCache,
  saveOfflineCache,
  sendPunchesToCloud,
  flushOfflineQueue,
};

if (require.main === module) {
  runBridge().catch((err) => {
    console.error('Fatal bridge daemon error:', err.message);
    process.exit(1);
  });
}
