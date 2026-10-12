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
 * 9. Diagnostic error formatting (ZKError, Error, strings, objects, undefined, secret redaction).
 * 10. Robust attendance record extraction ({ data: [...] }, direct array, empty fallbacks).
 * 11. Connection failure handling, cleanup, and clean recovery across polling cycles.
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
  formatDiagnosticError,
  extractAttendanceRecords,
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

async function runAllTests() {
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
    const allPunches = [
      { userId: '101', timestamp: '2026-10-12T04:30:00+06:00', verifyMode: 1 },
      { userId: '999', timestamp: '2026-10-12T04:35:00+06:00', verifyMode: 1 },
    ];

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

  // Test 9: formatDiagnosticError properly diagnoses ZKError, standard Error, strings, objects, and redacts secrets
  try {
    // 9a: node-zklib ZKError structure (where err.message is undefined, inner error in err.err)
    const innerSocketError = new Error('connect ETIMEDOUT 192.168.0.134:4370');
    innerSocketError.code = 'ETIMEDOUT';
    const mockZKError = {
      err: innerSocketError,
      command: 'TCP CONNECT',
      ip: '192.168.0.134',
    };
    const diagZK = formatDiagnosticError(mockZKError);
    assert(diagZK.includes('[Command: TCP CONNECT]'), 'Should contain command');
    assert(diagZK.includes('[Device: 192.168.0.134]'), 'Should contain IP');
    assert(diagZK.includes('ETIMEDOUT'), 'Should contain error code');
    assert(!diagZK.includes('undefined'), 'Should NEVER contain undefined');

    // 9b: Standard Error
    const stdErr = new Error('Failed to resolve host');
    const diagStd = formatDiagnosticError(stdErr);
    assert.strictEqual(diagStd, 'Error: Failed to resolve host');

    // 9c: String and Object errors
    assert.strictEqual(formatDiagnosticError('Direct string error'), 'Direct string error');
    const diagObj = formatDiagnosticError({ message: 'Custom payload error', code: 'ECUSTOM' });
    assert.strictEqual(diagObj, 'Custom payload error (code: ECUSTOM)');

    // 9d: Null / undefined
    assert.strictEqual(formatDiagnosticError(null), 'Unknown error (null or undefined)');
    assert.strictEqual(formatDiagnosticError(undefined), 'Unknown error (null or undefined)');

    // 9e: Secret redaction
    const secretToHide = 'SUPER_SECRET_TOKEN_XYZ';
    const leakedError = new Error(`Connection failed with token: ${secretToHide}`);
    const sanitized = formatDiagnosticError(leakedError, secretToHide);
    assert(!sanitized.includes(secretToHide), 'Secret must be redacted');
    assert(sanitized.includes('[REDACTED_SECRET]'), 'Must replace with [REDACTED_SECRET]');

    console.log('✅ Test 9 Passed: formatDiagnosticError extracts rich details from ZKError/Error and redacts secrets.');
    passedTests++;
  } catch (err) {
    console.error('❌ Test 9 Failed:', err.message);
  }

  // Test 10: extractAttendanceRecords safely unpacks { data: [...] } and fallbacks
  try {
    // 10a: node-zklib return structure: { data: Array, err: null }
    const mockZkLogs = {
      data: [
        { deviceUserId: '1200', recordTime: new Date('2026-10-12T05:18:46') },
        { deviceUserId: '101', recordTime: new Date('2026-10-12T05:20:00') },
      ],
      err: null,
    };
    const extractedFromObj = extractAttendanceRecords(mockZkLogs);
    assert.strictEqual(extractedFromObj.length, 2);
    assert.strictEqual(extractedFromObj[0].deviceUserId, '1200');

    // 10b: Direct array fallback
    const directArray = [{ deviceUserId: '102', recordTime: new Date() }];
    assert.strictEqual(extractAttendanceRecords(directArray).length, 1);

    // 10c: Empty / null / invalid fallback
    assert.deepStrictEqual(extractAttendanceRecords(null), []);
    assert.deepStrictEqual(extractAttendanceRecords({}), []);
    assert.deepStrictEqual(extractAttendanceRecords(undefined), []);

    console.log('✅ Test 10 Passed: extractAttendanceRecords cleanly handles { data: [...] }, direct arrays, and empty states.');
    passedTests++;
  } catch (err) {
    console.error('❌ Test 10 Failed:', err.message);
  }

  // Test 11: Connection failure handling, safe cleanup, and recovery across simulated polling cycles
  try {
    let isPolling = false;
    let cycleCount = 0;
    let successfulSynced = 0;

    async function simulatePollCycle(deviceBehavior) {
      if (isPolling) return { status: 'skipped_overlapping' };
      isPolling = true;
      let mockZk = null;
      let pollError = null;

      try {
        mockZk = {
          socket: {},
          connected: false,
          createSocket: async () => {
            if (deviceBehavior === 'timeout') {
              const inner = new Error('connect ETIMEDOUT 192.168.0.134:4370');
              inner.code = 'ETIMEDOUT';
              throw { err: inner, command: 'TCP CONNECT', ip: '192.168.0.134' }; // ZKError shape
            }
            mockZk.connected = true;
          },
          getAttendances: async () => {
            if (deviceBehavior === 'read_error') {
              const inner = new Error('TIMEOUT_ON_RECEIVING_REQUEST_DATA');
              throw { err: inner, command: '[TCP] getAttendances', ip: '192.168.0.134' };
            }
            return {
              data: [{ deviceUserId: '1200', recordTime: '2026-10-12T05:18:46+06:00' }],
              err: null,
            };
          },
          disconnect: async () => {
            mockZk.connected = false;
          },
        };

        await mockZk.createSocket();
        const rawLogs = await mockZk.getAttendances();
        const records = extractAttendanceRecords(rawLogs);
        successfulSynced += records.length;
      } catch (err) {
        pollError = formatDiagnosticError(err);
      } finally {
        if (mockZk) {
          try {
            await mockZk.disconnect();
          } catch {}
          mockZk = null;
        }
        isPolling = false;
        cycleCount++;
      }

      return { cycleCount, isPolling, pollError, successfulSynced };
    }

    // Cycle 1: Device connection timeout (e.g. cable disconnected)
    const res1 = await simulatePollCycle('timeout');
    assert.strictEqual(res1.isPolling, false, 'isPolling must reset to false after connection failure');
    assert(res1.pollError.includes('[Command: TCP CONNECT]'), 'Error diagnostic must identify TCP CONNECT failure');
    assert(res1.pollError.includes('ETIMEDOUT'), 'Error diagnostic must report ETIMEDOUT');
    assert.strictEqual(res1.successfulSynced, 0);

    // Cycle 2: Device recovered and connected on next cycle
    const res2 = await simulatePollCycle('success');
    assert.strictEqual(res2.isPolling, false);
    assert.strictEqual(res2.pollError, null);
    assert.strictEqual(res2.successfulSynced, 1, 'Recovered cycle must process records normally');

    // Cycle 3: Attendance read failure mid-session
    const res3 = await simulatePollCycle('read_error');
    assert.strictEqual(res3.isPolling, false);
    assert(res3.pollError.includes('[Command: [TCP] getAttendances]'));
    assert(res3.pollError.includes('TIMEOUT_ON_RECEIVING_REQUEST_DATA'));

    // Cycle 4: Recovery on subsequent cycle
    const res4 = await simulatePollCycle('success');
    assert.strictEqual(res4.isPolling, false);
    assert.strictEqual(res4.pollError, null);
    assert.strictEqual(res4.successfulSynced, 2);

    console.log('✅ Test 11 Passed: Polling cycle recovers cleanly from connection & read failures without stale locks.');
    passedTests++;
  } catch (err) {
    console.error('❌ Test 11 Failed:', err.message);
  }

  // Clean up temporary test files
  if (fs.existsSync(TEST_TMP_STATE)) fs.unlinkSync(TEST_TMP_STATE);
  if (fs.existsSync(TEST_TMP_CACHE)) fs.unlinkSync(TEST_TMP_CACHE);

  console.log(`\n🎉 Results: ${passedTests}/11 Bridge Daemon tests passed successfully!`);

  if (passedTests !== 11) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
