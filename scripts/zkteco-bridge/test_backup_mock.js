/**
 * Automated Local Mock Test Suite for K60 Backup Utility
 * 
 * Tests extraction validation, incomplete error handling, count mismatch detection,
 * and accidental overwrite protection WITHOUT connecting to the physical device.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { runBackup, queryDeviceInfo, calculateSha256 } = require('./backup_k60');

const TEST_OUT_DIR = path.join(__dirname, 'test_mock_backups');

function cleanupTestDir() {
  if (fs.existsSync(TEST_OUT_DIR)) {
    fs.rmSync(TEST_OUT_DIR, { recursive: true, force: true });
  }
}

async function runAllTests() {
  console.log('🧪 ================================================================');
  console.log('🧪  K60 Backup Utility - Offline Mock Test Suite');
  console.log('🧪  (Zero network requests to physical device)');
  console.log('🧪 ================================================================\n');

  cleanupTestDir();
  let passed = 0;
  let failed = 0;

  // -------------------------------------------------------------
  // Test 1: Complete Verified Extraction
  // -------------------------------------------------------------
  try {
    console.log('▶️ [Test 1] Verifying 100% Complete & Matching Extraction...');
    const mockZkComplete = {
      async createSocket() { return true; },
      async getInfo() { return { userCounts: 5, logCounts: 20, logCapacity: 100000 }; },
      async getUsers() {
        const users = Array.from({ length: 5 }, (_, i) => ({ uid: i + 1, userId: String(i + 1), name: `User ${i}` }));
        return { data: users, err: null };
      },
      async getAttendances() {
        const logs = Array.from({ length: 20 }, (_, i) => ({ deviceUserId: String(i % 5), recordTime: new Date().toISOString() }));
        return { data: logs, err: null };
      },
      async disconnect() { return true; },
    };

    const res1 = await runBackup({
      zkClient: mockZkComplete,
      outputDir: TEST_OUT_DIR,
    });

    assert.strictEqual(res1.success, true, 'Result should be successful');
    assert.strictEqual(res1.status, 'VERIFIED_COMPLETE', 'Status must be VERIFIED_COMPLETE');
    assert.strictEqual(res1.extractedUsersCount, 5, 'Must extract 5 users');
    assert.strictEqual(res1.extractedLogsCount, 20, 'Must extract 20 logs');

    // Verify files & SHA-256
    const manifestPath = path.join(res1.backupDir, 'manifest.json');
    assert.strictEqual(fs.existsSync(manifestPath), true, 'manifest.json must exist');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.strictEqual(manifest.status, 'VERIFIED_COMPLETE', 'Manifest status must match');
    assert.strictEqual(manifest.validation.userCountMatch, true, 'User count match must be true');
    assert.strictEqual(manifest.validation.logCountMatch, true, 'Log count match must be true');

    const attContent = fs.readFileSync(path.join(res1.backupDir, 'attendance_logs.json'), 'utf8');
    assert.strictEqual(manifest.checksums['attendance_logs.json'], calculateSha256(attContent), 'Checksum must match file content');

    console.log('✅ [Test 1 PASSED]: Complete verified extraction and manifest checksum confirmed.\n');
    passed++;
  } catch (err) {
    console.error('❌ [Test 1 FAILED]:', err.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 2: Incomplete Extraction with Packet Errors (Must NOT claim SUCCESS)
  // -------------------------------------------------------------
  try {
    console.log('▶️ [Test 2] Verifying Incomplete Extraction Detection (Packet Error)...');
    const mockZkIncomplete = {
      async createSocket() { return true; },
      async getInfo() { return { userCounts: 5, logCounts: 20, logCapacity: 100000 }; },
      async getUsers() { return { data: [], err: null }; },
      async getAttendances() {
        // Simulating packet timeout halfway through extraction
        const partialLogs = Array.from({ length: 8 }, (_, i) => ({ deviceUserId: String(i), recordTime: new Date().toISOString() }));
        return { data: partialLogs, err: new Error('TIMEOUT WHEN RECEIVING PACKET') };
      },
      async disconnect() { return true; },
    };

    const res2 = await runBackup({
      zkClient: mockZkIncomplete,
      outputDir: TEST_OUT_DIR,
    });

    assert.strictEqual(res2.success, false, 'Result must NOT be success when err is present');
    assert.strictEqual(res2.status, 'INCOMPLETE_EXTRACTION', 'Status must be INCOMPLETE_EXTRACTION');
    assert(res2.errors.some(e => e.includes('TIMEOUT WHEN RECEIVING PACKET')), 'Errors must contain timeout error');

    const manifest = JSON.parse(fs.readFileSync(path.join(res2.backupDir, 'manifest.json'), 'utf8'));
    assert.strictEqual(manifest.status, 'INCOMPLETE_EXTRACTION', 'Manifest must record INCOMPLETE_EXTRACTION');
    assert.strictEqual(manifest.validation.hasPacketErrors, true, 'Manifest must flag hasPacketErrors=true');

    console.log('✅ [Test 2 PASSED]: Incomplete extraction correctly prevented SUCCESS status.\n');
    passed++;
  } catch (err) {
    console.error('❌ [Test 2 FAILED]:', err.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 3: Record Count Mismatch Detection (Must NOT claim SUCCESS)
  // -------------------------------------------------------------
  try {
    console.log('▶️ [Test 3] Verifying Record Count Mismatch Detection...');
    const mockZkMismatch = {
      async createSocket() { return true; },
      async getInfo() { return { userCounts: 10, logCounts: 100, logCapacity: 100000 }; },
      async getUsers() {
        const users = Array.from({ length: 10 }, (_, i) => ({ uid: i + 1, userId: String(i + 1) }));
        return { data: users, err: null };
      },
      async getAttendances() {
        // Extracted only 65 out of 100 reported records
        const logs = Array.from({ length: 65 }, (_, i) => ({ deviceUserId: String(i), recordTime: new Date().toISOString() }));
        return { data: logs, err: null };
      },
      async disconnect() { return true; },
    };

    const res3 = await runBackup({
      zkClient: mockZkMismatch,
      outputDir: TEST_OUT_DIR,
    });

    assert.strictEqual(res3.success, false, 'Result must NOT be success when counts mismatch');
    assert.strictEqual(res3.status, 'INCOMPLETE_MISMATCH', 'Status must be INCOMPLETE_MISMATCH');
    assert(res3.errors.some(e => e.includes('Device reported 100 attendance logs, but only 65 were extracted')), 'Must log discrepancy');

    const manifest = JSON.parse(fs.readFileSync(path.join(res3.backupDir, 'manifest.json'), 'utf8'));
    assert.strictEqual(manifest.validation.logCountMatch, false, 'Log count match must be false');

    console.log('✅ [Test 3 PASSED]: Count mismatch detected and flagged accurately in manifest.\n');
    passed++;
  } catch (err) {
    console.error('❌ [Test 3 FAILED]:', err.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 4: Accidental Overwrite Protection
  // -------------------------------------------------------------
  try {
    console.log('▶️ [Test 4] Verifying Accidental Overwrite Protection...');
    const mockZk = {
      async createSocket() { return true; },
      async getInfo() { return { userCounts: 2, logCounts: 4, logCapacity: 100000 }; },
      async getUsers() { return { data: [{ uid: 1, userId: '1' }, { uid: 2, userId: '2' }], err: null }; },
      async getAttendances() { return { data: [{ deviceUserId: '1' }], err: null }; },
      async disconnect() { return true; },
    };

    const resRun1 = await runBackup({ zkClient: mockZk, outputDir: TEST_OUT_DIR });
    const resRun2 = await runBackup({ zkClient: mockZk, outputDir: TEST_OUT_DIR });

    assert.notStrictEqual(resRun1.backupDir, resRun2.backupDir, 'Consecutive backup runs must create distinct directories');
    assert.strictEqual(fs.existsSync(resRun1.backupDir), true, 'Run 1 directory must still exist');
    assert.strictEqual(fs.existsSync(resRun2.backupDir), true, 'Run 2 directory must still exist');

    console.log('✅ [Test 4 PASSED]: Distinct timestamped isolation preserves previous backups from overwrite.\n');
    passed++;
  } catch (err) {
    console.error('❌ [Test 4 FAILED]:', err.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 5: Missing Hardware Counters (Must NOT claim SUCCESS)
  // -------------------------------------------------------------
  try {
    console.log('▶️ [Test 5] Verifying Missing Hardware Counters (getInfo failure)...');
    const mockZkNoInfo = {
      async createSocket() { return true; },
      async getInfo() { throw new Error('CMD_GET_FREE_SIZES failed'); },
      async getUsers() { return { data: [{ uid: 1, userId: '1' }], err: null }; },
      async getAttendances() { return { data: [{ deviceUserId: '1' }], err: null }; },
      async disconnect() { return true; },
    };

    const res5 = await runBackup({ zkClient: mockZkNoInfo, outputDir: TEST_OUT_DIR });

    assert.strictEqual(res5.success, false, 'Result must NOT be success when device counters are missing');
    assert.strictEqual(res5.status, 'UNVERIFIED_NO_COUNTERS', 'Status must be UNVERIFIED_NO_COUNTERS');
    assert(res5.errors.some(e => e.includes('Device hardware counters could not be retrieved')), 'Must log counter retrieval failure');

    const manifest = JSON.parse(fs.readFileSync(path.join(res5.backupDir, 'manifest.json'), 'utf8'));
    assert.strictEqual(manifest.status, 'UNVERIFIED_NO_COUNTERS', 'Manifest status must match');
    assert.strictEqual(manifest.biometricScope.biometricTemplatesBackedUp, false, 'Manifest must confirm templates are not backed up');

    console.log('✅ [Test 5 PASSED]: Missing hardware counters correctly prevent VERIFIED_COMPLETE status.\n');
    passed++;
  } catch (err) {
    console.error('❌ [Test 5 FAILED]:', err.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 6: Attendance Count Overage (Must NOT claim SUCCESS)
  // -------------------------------------------------------------
  try {
    console.log('▶️ [Test 6] Verifying Attendance Count Overage Detection...');
    const mockZkAttOverage = {
      async createSocket() { return true; },
      async getInfo() { return { userCounts: 5, logCounts: 50, logCapacity: 100000 }; },
      async getUsers() {
        const users = Array.from({ length: 5 }, (_, i) => ({ uid: i + 1, userId: String(i + 1) }));
        return { data: users, err: null };
      },
      async getAttendances() {
        // Extracted 55 records when device reported only 50
        const logs = Array.from({ length: 55 }, (_, i) => ({ deviceUserId: String(i), recordTime: new Date().toISOString() }));
        return { data: logs, err: null };
      },
      async disconnect() { return true; },
    };

    const res6 = await runBackup({ zkClient: mockZkAttOverage, outputDir: TEST_OUT_DIR });

    assert.strictEqual(res6.success, false, 'Result must NOT be success when attendance count is over reported');
    assert.strictEqual(res6.status, 'INCOMPLETE_MISMATCH', 'Status must be INCOMPLETE_MISMATCH on overage');
    assert(res6.errors.some(e => e.includes('Count Mismatch (Overage)')), 'Must flag Count Mismatch (Overage)');

    const manifest = JSON.parse(fs.readFileSync(path.join(res6.backupDir, 'manifest.json'), 'utf8'));
    assert.strictEqual(manifest.isVerifiedCompleteBackup, false, 'isVerifiedCompleteBackup must be false');
    assert.strictEqual(manifest.validation.logCountMatch, false, 'logCountMatch must be false');
    assert.strictEqual(fs.existsSync(path.join(res6.backupDir, 'INCOMPLETE_BACKUP_DO_NOT_USE.txt')), true, 'Incomplete warning banner must exist');

    console.log('✅ [Test 6 PASSED]: Attendance count overage correctly caught and failed.\n');
    passed++;
  } catch (err) {
    console.error('❌ [Test 6 FAILED]:', err.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 7: User Count Overage (Must NOT claim SUCCESS)
  // -------------------------------------------------------------
  try {
    console.log('▶️ [Test 7] Verifying User Count Overage Detection...');
    const mockZkUserOverage = {
      async createSocket() { return true; },
      async getInfo() { return { userCounts: 10, logCounts: 20, logCapacity: 100000 }; },
      async getUsers() {
        // Extracted 12 users when device reported 10
        const users = Array.from({ length: 12 }, (_, i) => ({ uid: i + 1, userId: String(i + 1) }));
        return { data: users, err: null };
      },
      async getAttendances() {
        const logs = Array.from({ length: 20 }, (_, i) => ({ deviceUserId: String(i), recordTime: new Date().toISOString() }));
        return { data: logs, err: null };
      },
      async disconnect() { return true; },
    };

    const res7 = await runBackup({ zkClient: mockZkUserOverage, outputDir: TEST_OUT_DIR });

    assert.strictEqual(res7.success, false, 'Result must NOT be success when user count is over reported');
    assert.strictEqual(res7.status, 'INCOMPLETE_MISMATCH', 'Status must be INCOMPLETE_MISMATCH on overage');
    assert(res7.errors.some(e => e.includes('Count Mismatch (Overage)')), 'Must flag Count Mismatch (Overage) for users');

    const manifest = JSON.parse(fs.readFileSync(path.join(res7.backupDir, 'manifest.json'), 'utf8'));
    assert.strictEqual(manifest.isVerifiedCompleteBackup, false, 'isVerifiedCompleteBackup must be false');
    assert.strictEqual(manifest.validation.userCountMatch, false, 'userCountMatch must be false');
    assert.strictEqual(fs.existsSync(path.join(res7.backupDir, 'INCOMPLETE_BACKUP_DO_NOT_USE.txt')), true, 'Incomplete warning banner must exist');

    console.log('✅ [Test 7 PASSED]: User count overage correctly caught and failed.\n');
    passed++;
  } catch (err) {
    console.error('❌ [Test 7 FAILED]:', err.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 8: Missing Users Data Array (Must NOT claim SUCCESS)
  // -------------------------------------------------------------
  try {
    console.log('▶️ [Test 8] Verifying Missing Users Data Array Detection...');
    const mockZkMissingUsers = {
      async createSocket() { return true; },
      async getInfo() { return { userCounts: 5, logCounts: 20, logCapacity: 100000 }; },
      async getUsers() {
        // Returns null data array
        return { data: null, err: null };
      },
      async getAttendances() {
        const logs = Array.from({ length: 20 }, (_, i) => ({ deviceUserId: String(i), recordTime: new Date().toISOString() }));
        return { data: logs, err: null };
      },
      async disconnect() { return true; },
    };

    const res8 = await runBackup({ zkClient: mockZkMissingUsers, outputDir: TEST_OUT_DIR });

    assert.strictEqual(res8.success, false, 'Result must NOT be success when users data is missing');
    assert.strictEqual(res8.status, 'INVALID_DATA_STRUCTURE', 'Status must be INVALID_DATA_STRUCTURE');
    assert(res8.errors.some(e => e.includes('usersResult.data is not an array')), 'Must log missing users array error');

    const manifest = JSON.parse(fs.readFileSync(path.join(res8.backupDir, 'manifest.json'), 'utf8'));
    assert.strictEqual(manifest.isVerifiedCompleteBackup, false, 'isVerifiedCompleteBackup must be false');
    assert.strictEqual(manifest.validation.hasMissingDataArray, true, 'hasMissingDataArray must be true');
    assert.strictEqual(fs.existsSync(path.join(res8.backupDir, 'INCOMPLETE_BACKUP_DO_NOT_USE.txt')), true, 'Incomplete warning banner must exist');

    console.log('✅ [Test 8 PASSED]: Missing users data structure correctly flagged.\n');
    passed++;
  } catch (err) {
    console.error('❌ [Test 8 FAILED]:', err.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 9: Missing Attendance Data Array (Must NOT claim SUCCESS)
  // -------------------------------------------------------------
  try {
    console.log('▶️ [Test 9] Verifying Missing Attendance Logs Data Array Detection...');
    const mockZkMissingLogs = {
      async createSocket() { return true; },
      async getInfo() { return { userCounts: 5, logCounts: 20, logCapacity: 100000 }; },
      async getUsers() {
        const users = Array.from({ length: 5 }, (_, i) => ({ uid: i + 1, userId: String(i + 1) }));
        return { data: users, err: null };
      },
      async getAttendances() {
        // Returns undefined data array
        return { data: undefined, err: null };
      },
      async disconnect() { return true; },
    };

    const res9 = await runBackup({ zkClient: mockZkMissingLogs, outputDir: TEST_OUT_DIR });

    assert.strictEqual(res9.success, false, 'Result must NOT be success when attendances data is missing');
    assert.strictEqual(res9.status, 'INVALID_DATA_STRUCTURE', 'Status must be INVALID_DATA_STRUCTURE');
    assert(res9.errors.some(e => e.includes('attendancesResult.data is not an array')), 'Must log missing logs array error');

    const manifest = JSON.parse(fs.readFileSync(path.join(res9.backupDir, 'manifest.json'), 'utf8'));
    assert.strictEqual(manifest.isVerifiedCompleteBackup, false, 'isVerifiedCompleteBackup must be false');
    assert.strictEqual(manifest.validation.hasMissingDataArray, true, 'hasMissingDataArray must be true');

    console.log('✅ [Test 9 PASSED]: Missing attendance logs data structure correctly flagged.\n');
    passed++;
  } catch (err) {
    console.error('❌ [Test 9 FAILED]:', err.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 10: File Write Failure Handling (Must Fail Safely)
  // -------------------------------------------------------------
  try {
    console.log('▶️ [Test 10] Verifying File Write Failure Error Path...');
    const mockZk = {
      async createSocket() { return true; },
      async getInfo() { return { userCounts: 2, logCounts: 2, logCapacity: 100000 }; },
      async getUsers() { return { data: [{ uid: 1 }, { uid: 2 }], err: null }; },
      async getAttendances() { return { data: [{ id: 1 }, { id: 2 }], err: null }; },
      async disconnect() { return true; },
    };

    // Temporarily mock fs.writeFileSync to simulate an I/O / disk write error
    const originalWriteFileSync = fs.writeFileSync;
    let writeCalls = 0;
    fs.writeFileSync = function (...args) {
      writeCalls++;
      if (writeCalls === 1) {
        throw new Error('SIMULATED_DISK_WRITE_IO_ERROR: EACCES permission denied');
      }
      return originalWriteFileSync.apply(this, args);
    };

    let res10;
    try {
      res10 = await runBackup({ zkClient: mockZk, outputDir: TEST_OUT_DIR });
    } finally {
      fs.writeFileSync = originalWriteFileSync;
    }

    assert.strictEqual(res10.success, false, 'Write error must NOT report success');
    assert.strictEqual(res10.status, 'FILE_WRITE_ERROR', 'Status must be FILE_WRITE_ERROR');
    assert(res10.errors.some(e => e.includes('SIMULATED_DISK_WRITE_IO_ERROR')), 'Errors must contain disk write error');

    console.log('✅ [Test 10 PASSED]: Disk write error handled gracefully and prevented success.\n');
    passed++;
  } catch (err) {
    console.error('❌ [Test 10 FAILED]:', err.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 11: Raw Record Field Preservation & Sensitive Data Notice
  // -------------------------------------------------------------
  try {
    console.log('▶️ [Test 11] Verifying 100% Raw Record Field Preservation & Manifest Notice...');
    const sampleUser = {
      uid: 42,
      userId: 'EMP-007',
      name: 'Rahim Ahmed',
      role: 0,
      password: '1234_raw_secret',
      cardno: 987654321,
    };
    const sampleLog = {
      deviceUserId: 'EMP-007',
      recordTime: '2026-10-11T09:15:30.000Z',
      ip: '192.168.0.134',
    };

    const mockZkPreserve = {
      async createSocket() { return true; },
      async getInfo() { return { userCounts: 1, logCounts: 1, logCapacity: 100000 }; },
      async getUsers() { return { data: [sampleUser], err: null }; },
      async getAttendances() { return { data: [sampleLog], err: null }; },
      async disconnect() { return true; },
    };

    const res11 = await runBackup({ zkClient: mockZkPreserve, outputDir: TEST_OUT_DIR });

    assert.strictEqual(res11.success, true, 'Result should be successful for exact match');
    assert.strictEqual(res11.status, 'VERIFIED_COMPLETE', 'Status must be VERIFIED_COMPLETE');

    // Verify raw fields in users.json
    const usersJson = JSON.parse(fs.readFileSync(path.join(res11.backupDir, 'users.json'), 'utf8'));
    assert.deepStrictEqual(usersJson[0], sampleUser, 'Raw user fields and passwords must be 100% preserved without mutation');

    // Verify raw fields in attendance_logs.json
    const attJson = JSON.parse(fs.readFileSync(path.join(res11.backupDir, 'attendance_logs.json'), 'utf8'));
    assert.deepStrictEqual(attJson[0], sampleLog, 'Raw attendance fields must be 100% preserved');

    // Verify manifest security notices
    const manifest = JSON.parse(fs.readFileSync(path.join(res11.backupDir, 'manifest.json'), 'utf8'));
    assert.strictEqual(manifest.isVerifiedCompleteBackup, true, 'isVerifiedCompleteBackup must be true on complete backup');
    assert(manifest.sensitiveDataNotice && manifest.sensitiveDataNotice.includes('restricted filesystem access'), 'Must warn about sensitive credentials in raw backup');
    assert.strictEqual(manifest.biometricScope.biometricTemplatesBackedUp, false, 'Must confirm templates are not backed up');

    // Verify NO warning banner on verified complete backup
    assert.strictEqual(fs.existsSync(path.join(res11.backupDir, 'INCOMPLETE_BACKUP_DO_NOT_USE.txt')), false, 'Warning banner must NOT exist on verified complete backup');

    console.log('✅ [Test 11 PASSED]: Raw source record fields preserved 100% intact with manifest notices.\n');
    passed++;
  } catch (err) {
    console.error('❌ [Test 11 FAILED]:', err.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 12: Missing Data Array when Reported Count is Zero (Must Fail)
  // -------------------------------------------------------------
  try {
    console.log('▶️ [Test 12] Verifying Missing Data Array when Reported Count is Zero...');
    const mockZkZeroMissing = {
      async createSocket() { return true; },
      async getInfo() { return { userCounts: 0, logCounts: 0, logCapacity: 100000 }; },
      async getUsers() {
        // Reported count is 0, but returned data is null/malformed
        return { data: null, err: null };
      },
      async getAttendances() {
        return { data: null, err: null };
      },
      async disconnect() { return true; },
    };

    const res12 = await runBackup({ zkClient: mockZkZeroMissing, outputDir: TEST_OUT_DIR });

    assert.strictEqual(res12.success, false, 'Result must NOT be success when data arrays are null, even if reported count is 0');
    assert.strictEqual(res12.status, 'INVALID_DATA_STRUCTURE', 'Status must be INVALID_DATA_STRUCTURE');
    assert(res12.errors.some(e => e.includes('usersResult.data is not an array')), 'Must log missing users array error');
    assert(res12.errors.some(e => e.includes('attendancesResult.data is not an array')), 'Must log missing attendances array error');

    const manifest = JSON.parse(fs.readFileSync(path.join(res12.backupDir, 'manifest.json'), 'utf8'));
    assert.strictEqual(manifest.isVerifiedCompleteBackup, false, 'isVerifiedCompleteBackup must be false');
    assert.strictEqual(fs.existsSync(path.join(res12.backupDir, 'INCOMPLETE_BACKUP_DO_NOT_USE.txt')), true, 'Incomplete warning banner must exist');

    console.log('✅ [Test 12 PASSED]: Missing data array correctly prevented success on zero-count device.\n');
    passed++;
  } catch (err) {
    console.error('❌ [Test 12 FAILED]:', err.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 13: --info-only Mode Strictly Calls Only getInfo (No Users, No Logs, No Files Written)
  // -------------------------------------------------------------
  try {
    console.log('▶️ [Test 13] Verifying --info-only Mode Isolation & Zero File Writes...');
    let usersCalled = false;
    let attendancesCalled = false;
    let socketClosed = false;

    const mockZkInfoOnly = {
      async createSocket() { return true; },
      async getInfo() {
        return { userCounts: 35, logCounts: 1420, logCapacity: 100000 };
      },
      async getUsers() {
        usersCalled = true;
        throw new Error('FAIL: getUsers() must NEVER be called in --info-only mode');
      },
      async getAttendances() {
        attendancesCalled = true;
        throw new Error('FAIL: getAttendances() must NEVER be called in --info-only mode');
      },
      async disconnect() {
        socketClosed = true;
        return true;
      },
    };

    // Ensure output test dir is clean before info query
    cleanupTestDir();

    const infoRes = await queryDeviceInfo({ zkClient: mockZkInfoOnly });

    assert.strictEqual(infoRes.success, true, 'infoRes must be successful');
    assert.strictEqual(infoRes.deviceInfo.userCounts, 35, 'User count must match');
    assert.strictEqual(infoRes.deviceInfo.logCounts, 1420, 'Log count must match');
    assert.strictEqual(infoRes.deviceInfo.logCapacity, 100000, 'Log capacity must match');
    assert.strictEqual(usersCalled, false, 'getUsers() must NOT have been called');
    assert.strictEqual(attendancesCalled, false, 'getAttendances() must NOT have been called');
    assert.strictEqual(socketClosed, true, 'Socket must be cleanly disconnected after query');

    // Confirm that NO directories or backup files were written
    const filesWritten = fs.existsSync(TEST_OUT_DIR) ? fs.readdirSync(TEST_OUT_DIR) : [];
    assert.strictEqual(filesWritten.length, 0, '--info-only must NOT create any backup folders or write files');

    console.log('✅ [Test 13 PASSED]: --info-only mode verified: strictly queries getInfo() and writes 0 files.\n');
    passed++;
  } catch (err) {
    console.error('❌ [Test 13 FAILED]:', err.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 14: --info-only Failure Handling (Graceful Disconnect on Error)
  // -------------------------------------------------------------
  try {
    console.log('▶️ [Test 14] Verifying --info-only Error Handling & Safe Disconnect...');
    let socketClosed = false;

    const mockZkInfoError = {
      async createSocket() { return true; },
      async getInfo() {
        throw new Error('CMD_GET_FREE_SIZES socket timeout');
      },
      async disconnect() {
        socketClosed = true;
        return true;
      },
    };

    const errRes = await queryDeviceInfo({ zkClient: mockZkInfoError });

    assert.strictEqual(errRes.success, false, 'errRes must report success: false');
    assert.strictEqual(errRes.deviceInfo, null, 'deviceInfo must be null on failure');
    assert(errRes.errors.some(e => e.includes('CMD_GET_FREE_SIZES socket timeout')), 'Must record error message');
    assert.strictEqual(socketClosed, true, 'Socket must be disconnected even when getInfo throws');

    console.log('✅ [Test 14 PASSED]: --info-only error handled gracefully with guaranteed disconnect.\n');
    passed++;
  } catch (err) {
    console.error('❌ [Test 14 FAILED]:', err.message);
    failed++;
  }

  // Cleanup test artifacts
  cleanupTestDir();

  console.log('================================================================');
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((e) => {
  console.error('Fatal test runner error:', e);
  process.exit(1);
});
