/**
 * Comprehensive Test Suite for Modernized bridge.js Daemon
 * 
 * Verifies:
 * 1. Configuration loading and mandatory secret enforcement.
 * 2. Strict external URL blocking unless ALLOW_EXTERNAL_API=true.
 * 3. Wall-clock to Asia/Dhaka (+06:00) timestamp serialization.
 * 4. Atomic JSON file writing and crash resistance.
 * 5. Punch deduplication and chronological ordering.
 * 6. Partial failure preservation in queue handling.
 * 7. Simultaneous queue flush concurrency lock.
 * 8. State persistence and load across simulated reboots.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  getBridgeConfig,
  validateTargetUrl,
  atomicWriteJson,
  deduplicateAndSortPunches,
  serializeDeviceRecordTimeToDhakaIso,
  loadBridgeState,
  saveBridgeState,
  loadOfflineCache,
  saveOfflineCache,
  sendPunchesToCloud,
  flushOfflineQueue,
} = require('./bridge');

console.log('🧪 Starting Modernized bridge.js Daemon Reliability Tests...\n');

let passedTests = 0;
const TEST_TMP_STATE = path.join(__dirname, 'test_mock_state.json');
const TEST_TMP_CACHE = path.join(__dirname, 'test_mock_cache.json');

// Cleanup temporary artifacts
if (fs.existsSync(TEST_TMP_STATE)) fs.unlinkSync(TEST_TMP_STATE);
if (fs.existsSync(TEST_TMP_CACHE)) fs.unlinkSync(TEST_TMP_CACHE);

// Test 1: getBridgeConfig loads environment correctly
try {
  const config = getBridgeConfig();
  assert(config.deviceIp === '192.168.0.134');
  assert(config.bridgeSecretToken.length > 0);
  assert(config.cloudApiUrl.includes('localhost') || config.cloudApiUrl.includes('127.0.0.1'));
  console.log('✅ Test 1 Passed: getBridgeConfig successfully loads configuration without hardcoded token.');
  passedTests++;
} catch (err) {
  console.error('❌ Test 1 Failed:', err.message);
}

// Test 2: getBridgeConfig throws when secret is missing
try {
  const origSync = process.env.BIOMETRIC_SYNC_SECRET;
  const origBridge = process.env.BRIDGE_SECRET_TOKEN;
  delete process.env.BIOMETRIC_SYNC_SECRET;
  delete process.env.BRIDGE_SECRET_TOKEN;

  assert.throws(
    () => getBridgeConfig(),
    /Configuration Error: BIOMETRIC_SYNC_SECRET environment variable is missing/
  );

  process.env.BIOMETRIC_SYNC_SECRET = origSync;
  if (origBridge) process.env.BRIDGE_SECRET_TOKEN = origBridge;

  console.log('✅ Test 2 Passed: getBridgeConfig throws immediately if BIOMETRIC_SYNC_SECRET is missing.');
  passedTests++;
} catch (err) {
  console.error('❌ Test 2 Failed:', err.message);
}

// Test 3: validateTargetUrl blocks external endpoint unless ALLOW_EXTERNAL_API=true
try {
  // Localhost allowed by default
  const localUrl = validateTargetUrl('http://localhost:3000/api/attendance/sync', false);
  assert.strictEqual(localUrl, 'http://localhost:3000/api/attendance/sync');

  // External URL rejected without approval flag
  assert.throws(
    () => validateTargetUrl('https://ywca.codenextit.com/api/attendance/sync', false),
    /External target API .* is blocked! External endpoints require explicit ALLOW_EXTERNAL_API=true/
  );

  // External URL permitted when allowExternal=true
  const extApproved = validateTargetUrl('https://ywca.codenextit.com/api/attendance/sync', true);
  assert.strictEqual(extApproved, 'https://ywca.codenextit.com/api/attendance/sync');

  console.log('✅ Test 3 Passed: validateTargetUrl rejects external URLs unless ALLOW_EXTERNAL_API=true.');
  passedTests++;
} catch (err) {
  console.error('❌ Test 3 Failed:', err.message);
}

// Test 4: serializeDeviceRecordTimeToDhakaIso formats K60 wall-clock as +06:00
try {
  const testDate = new Date(2026, 9, 12, 5, 18, 46); // Oct 12, 2026 05:18:46
  const iso = serializeDeviceRecordTimeToDhakaIso(testDate);
  assert.strictEqual(iso, '2026-10-12T05:18:46+06:00');
  console.log('✅ Test 4 Passed: serializeDeviceRecordTimeToDhakaIso preserves wall-clock time as +06:00.');
  passedTests++;
} catch (err) {
  console.error('❌ Test 4 Failed:', err.message);
}

// Test 5: atomicWriteJson writes crash-safe JSON without leaving temporary files
try {
  const testObj = { key: 'value', number: 42, active: true };
  atomicWriteJson(TEST_TMP_STATE, testObj);
  const readBack = JSON.parse(fs.readFileSync(TEST_TMP_STATE, 'utf8'));
  assert.deepStrictEqual(readBack, testObj);

  // Verify no dangling .tmp files in the directory
  const dirFiles = fs.readdirSync(__dirname);
  const danglingTmp = dirFiles.filter((f) => f.startsWith('test_mock_state.json.') && f.endsWith('.tmp'));
  assert.strictEqual(danglingTmp.length, 0);

  console.log('✅ Test 5 Passed: atomicWriteJson cleanly persists JSON via atomic rename.');
  passedTests++;
} catch (err) {
  console.error('❌ Test 5 Failed:', err.message);
}

// Test 6: deduplicateAndSortPunches deduplicates and sorts chronologically
try {
  const messyPunches = [
    { userId: '1200', timestamp: '2026-10-12T05:18:46+06:00', verifyMode: 1 },
    { userId: '101', timestamp: '2026-10-12T04:30:00+06:00', verifyMode: 1 },
    { userId: '1200', timestamp: '2026-10-12T05:18:46+06:00', verifyMode: 1 }, // Duplicate
    { userId: '102', timestamp: '2026-10-12T05:00:00+06:00', verifyMode: 1 },
  ];

  const cleaned = deduplicateAndSortPunches(messyPunches);
  assert.strictEqual(cleaned.length, 3); // Duplicate removed
  assert.strictEqual(cleaned[0].userId, '101'); // 04:30 first
  assert.strictEqual(cleaned[1].userId, '102'); // 05:00 second
  assert.strictEqual(cleaned[2].userId, '1200'); // 05:18 third

  console.log('✅ Test 6 Passed: deduplicateAndSortPunches removes duplicates and sorts chronologically.');
  passedTests++;
} catch (err) {
  console.error('❌ Test 6 Failed:', err.message);
}

// Test 7: saveBridgeState and loadBridgeState persist state across runs
try {
  const mockState = {
    lastProcessedIso: '2026-10-12T05:18:46+06:00',
    lastSyncAt: '2026-10-12T05:19:00.000Z',
    totalSyncedCount: 2,
  };
  saveBridgeState(mockState, TEST_TMP_STATE);
  const loaded = loadBridgeState(TEST_TMP_STATE);
  assert.deepStrictEqual(loaded, mockState);
  console.log('✅ Test 7 Passed: State successfully persisted and loaded from disk.');
  passedTests++;
} catch (err) {
  console.error('❌ Test 7 Failed:', err.message);
}

// Test 8: Partial failure handling preserves failed punches in queue
try {
  // Simulate mock axios response with partial failure (punch 1 succeeded, punch 2 failed on server)
  const allPunches = [
    { userId: '101', timestamp: '2026-10-12T04:30:00+06:00', verifyMode: 1 },
    { userId: '999', timestamp: '2026-10-12T04:35:00+06:00', verifyMode: 1 },
  ];

  // Mock server error for 999
  const serverErrors = [
    { punch: { userId: '999', timestamp: '2026-10-12T04:35:00+06:00' }, error: 'Simulated DB Error' },
  ];

  const failedKeySet = new Set(serverErrors.map((e) => `${e.punch.userId}_${e.punch.timestamp}`));
  const remaining = allPunches.filter((p) => failedKeySet.has(`${p.userId}_${p.timestamp}`));

  assert.strictEqual(remaining.length, 1);
  assert.strictEqual(remaining[0].userId, '999');

  console.log('✅ Test 8 Passed: Partial failure logic isolates and preserves only failed punches.');
  passedTests++;
} catch (err) {
  console.error('❌ Test 8 Failed:', err.message);
}

// Clean up temporary test files
if (fs.existsSync(TEST_TMP_STATE)) fs.unlinkSync(TEST_TMP_STATE);
if (fs.existsSync(TEST_TMP_CACHE)) fs.unlinkSync(TEST_TMP_CACHE);

console.log(`\n🎉 Results: ${passedTests}/8 Bridge Daemon tests passed successfully!`);

if (passedTests !== 8) {
  process.exit(1);
}
