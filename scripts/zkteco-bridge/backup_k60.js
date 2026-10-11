/**
 * YWCA School - ZKTeco K60 Biometric Device Read-Only Backup Utility
 * 
 * Extracts full historical attendance records, user profiles, and device metadata.
 * 
 * Safety & Integrity Features:
 * 1. STRICTLY READ-ONLY: Never sends clear/erase/write commands to the physical device.
 * 2. RECORD-COUNT VALIDATION: Validates extracted counts against device-reported hardware counters (getInfo).
 * 3. INCOMPLETE EXTRACTION DETECTION: Inspects library packet errors (attendances.err, users.err) and aborts SUCCESS status if partial.
 * 4. OVERWRITE PROTECTION: Saves to isolated timestamped directory with SHA-256 cryptographic manifest.
 * 5. SAFE MOCK MODE: Can be run with --mock for safe local testing without touching the physical device.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const DEFAULT_CONFIG = {
  deviceIp: process.env.DEVICE_IP || '192.168.0.134',
  devicePort: parseInt(process.env.DEVICE_PORT || '4370', 10),
  timeoutMs: parseInt(process.env.TIMEOUT_MS || '15000', 10),
  inport: 4000,
  backupRootDir: path.join(__dirname, 'backups'),
};

function calculateSha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function getUniqueBackupDir(baseDir) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  let backupDir = path.join(baseDir, `k60_backup_${timestamp}`);
  let counter = 1;
  while (fs.existsSync(backupDir)) {
    backupDir = path.join(baseDir, `k60_backup_${timestamp}_${counter}`);
    counter++;
  }
  fs.mkdirSync(backupDir, { recursive: true });
  return backupDir;
}

/**
 * Core backup extraction runner
 * @param {Object} options
 * @param {Object} [options.zkClient] - Optional injected client for testing/mocking
 * @param {string} [options.deviceIp]
 * @param {number} [options.devicePort]
 * @param {string} [options.outputDir]
 * @param {boolean} [options.dryRun]
 * @returns {Promise<Object>} Backup result summary
 */
async function runBackup(options = {}) {
  const ip = options.deviceIp || DEFAULT_CONFIG.deviceIp;
  const port = options.devicePort || DEFAULT_CONFIG.devicePort;
  const baseDir = options.outputDir || DEFAULT_CONFIG.backupRootDir;

  console.log('================================================================');
  console.log('  🔒 ZKTeco K60 Biometric Device - Secure Read-Only Backup Utility');
  console.log(`  Target Device : ${ip}:${port} (TCP)`);
  console.log(`  Timestamp     : ${new Date().toISOString()}`);
  console.log('================================================================');

  let zk = options.zkClient;
  let isMock = !!options.zkClient;

  if (!zk) {
    // Real physical client instance
    const ZKLib = require('node-zklib');
    zk = new ZKLib(ip, port, DEFAULT_CONFIG.timeoutMs, DEFAULT_CONFIG.inport);
  }

  const errors = [];
  let socketConnected = false;
  let deviceInfo = null;
  let usersResult = null;
  let attendancesResult = null;
  let backupStatus = 'FAILED';

  const backupDir = getUniqueBackupDir(baseDir);
  console.log(`📁 Backup Destination: ${backupDir}`);

  try {
    // Step 1: Connect Socket
    console.log('\n[1/4] 🔌 Connecting to device via TCP port 4370...');
    await zk.createSocket();
    socketConnected = true;
    console.log('  ✅ Connection established successfully.');

    // Step 2: Query Device-Reported Stats (Record Count Source of Truth)
    console.log('\n[2/4] 📊 Querying device hardware counters (CMD_GET_FREE_SIZES)...');
    try {
      deviceInfo = await zk.getInfo();
      console.log('  ✅ Hardware counters retrieved:');
      console.log(`     • User count on device    : ${deviceInfo.userCounts ?? 'Unknown'}`);
      console.log(`     • Attendance logs count   : ${deviceInfo.logCounts ?? 'Unknown'}`);
      console.log(`     • Device log capacity     : ${deviceInfo.logCapacity ?? 'Unknown'}`);
    } catch (infoErr) {
      const msg = `Failed to query device counters: ${infoErr.message}`;
      console.error(`  ❌ ${msg}`);
      errors.push(msg);
      deviceInfo = { userCounts: null, logCounts: null, logCapacity: null, error: infoErr.message };
    }

    // Step 3: Extract Users / Staff Biometric Profiles
    console.log('\n[3/4] 👥 Extracting registered users list (read-only)...');
    try {
      usersResult = await zk.getUsers();
      if (usersResult && usersResult.err) {
        const msg = `User extraction warning/error: ${usersResult.err.message || usersResult.err}`;
        console.warn(`  ⚠️ ${msg}`);
        errors.push(msg);
      }
      const userCount = usersResult?.data?.length || 0;
      console.log(`  ✅ Extracted ${userCount} user record(s).`);
    } catch (userErr) {
      const msg = `Failed to extract users: ${userErr.message}`;
      console.error(`  ❌ ${msg}`);
      errors.push(msg);
      usersResult = { data: null, err: userErr };
    }

    // Step 4: Extract Historical Attendance Logs
    console.log('\n[4/4] 📋 Extracting historical attendance logs (read-only)...');
    try {
      attendancesResult = await zk.getAttendances((received, total) => {
        if (total > 0) {
          const percent = Math.round((received / total) * 100);
          process.stdout.write(`\r  📥 Downloading log stream: ${percent}% (${received}/${total} bytes)`);
        }
      });
      process.stdout.write('\n');

      if (attendancesResult && attendancesResult.err) {
        const msg = `Attendance logs extraction warning/error: ${attendancesResult.err.message || attendancesResult.err}`;
        console.warn(`  ⚠️ ${msg}`);
        errors.push(msg);
      }
      const logCount = attendancesResult?.data?.length || 0;
      console.log(`  ✅ Extracted ${logCount} attendance punch record(s).`);
    } catch (attErr) {
      const msg = `Failed to extract attendance logs: ${attErr.message}`;
      console.error(`  ❌ ${msg}`);
      errors.push(msg);
      attendancesResult = { data: null, err: attErr };
    }

    // Validation & Verification Phase
    console.log('\n----------------------------------------------------------------');
    console.log('🔍 Extraction Verification & Validation Check:');

    const rawUsers = Array.isArray(usersResult?.data) ? usersResult.data : null;
    const rawLogs = Array.isArray(attendancesResult?.data) ? attendancesResult.data : null;

    let hasMissingDataArray = false;
    if (!rawUsers) {
      hasMissingDataArray = true;
      const msg = 'Missing or invalid users data structure: usersResult.data is not an array.';
      console.error(`  ❌ ${msg}`);
      errors.push(msg);
    }

    if (!rawLogs) {
      hasMissingDataArray = true;
      const msg = 'Missing or invalid attendance logs data structure: attendancesResult.data is not an array.';
      console.error(`  ❌ ${msg}`);
      errors.push(msg);
    }

    const extractedUsersCount = rawUsers ? rawUsers.length : 0;
    const extractedLogsCount = rawLogs ? rawLogs.length : 0;
    const expectedUsersCount = deviceInfo?.userCounts;
    const expectedLogsCount = deviceInfo?.logCounts;

    let hasIncompletePacketError = !!(usersResult?.err || attendancesResult?.err);
    let hasCountMismatch = false;

    // Strict exact equality matching (both underage AND overage must fail)
    let userCountMatch = false;
    let logCountMatch = false;

    if (expectedLogsCount === null || expectedLogsCount === undefined || expectedUsersCount === null || expectedUsersCount === undefined) {
      backupStatus = 'UNVERIFIED_NO_COUNTERS';
      const msg = 'Device hardware counters could not be retrieved from getInfo(); extraction cannot be verified as complete.';
      console.error(`  ❌ ${msg}`);
      errors.push(msg);
    } else {
      userCountMatch = (rawUsers !== null && extractedUsersCount === expectedUsersCount);
      logCountMatch = (rawLogs !== null && extractedLogsCount === expectedLogsCount);

      if (!logCountMatch) {
        hasCountMismatch = true;
        let msg = '';
        if (extractedLogsCount < expectedLogsCount) {
          msg = `Count Mismatch (Underage): Device reported ${expectedLogsCount} attendance logs, but only ${extractedLogsCount} were extracted.`;
        } else {
          msg = `Count Mismatch (Overage): Device reported ${expectedLogsCount} attendance logs, but ${extractedLogsCount} were extracted (potential stream corruption or desynchronized buffer).`;
        }
        console.error(`  ❌ ${msg}`);
        errors.push(msg);
      } else {
        console.log(`  ✅ Attendance count verified: exactly ${extractedLogsCount}/${expectedLogsCount} records.`);
      }

      if (!userCountMatch) {
        hasCountMismatch = true;
        let msg = '';
        if (extractedUsersCount < expectedUsersCount) {
          msg = `Count Mismatch (Underage): Device reported ${expectedUsersCount} users, but only ${extractedUsersCount} were extracted.`;
        } else {
          msg = `Count Mismatch (Overage): Device reported ${expectedUsersCount} users, but ${extractedUsersCount} were extracted (potential stream corruption or desynchronized buffer).`;
        }
        console.error(`  ❌ ${msg}`);
        errors.push(msg);
      } else {
        console.log(`  ✅ User count verified: exactly ${extractedUsersCount}/${expectedUsersCount} records.`);
      }

      if (expectedUsersCount === 0 && expectedLogsCount === 0) {
        const zeroMsg = 'Device reported 0 users and 0 attendance logs. On an active school device with staff, this indicates uninitialized or blank memory.';
        console.warn(`  ⚠️ ${zeroMsg}`);
        errors.push(zeroMsg);
      }

      if (hasMissingDataArray) {
        backupStatus = 'INVALID_DATA_STRUCTURE';
        console.error('  ❌ EXTRACTION FAILED: Returned data structure is missing or invalid.');
      } else if (hasIncompletePacketError) {
        backupStatus = 'INCOMPLETE_EXTRACTION';
        console.error('  ❌ EXTRACTION INCOMPLETE: Socket or packet stream error reported by node-zklib.');
      } else if (hasCountMismatch) {
        backupStatus = 'INCOMPLETE_MISMATCH';
        console.error('  ❌ EXTRACTION INCOMPLETE: Record count does not match device hardware counters.');
      } else if (errors.length > 0) {
        backupStatus = 'PARTIAL_WITH_ERRORS';
        console.error('  ⚠️ Backup completed with non-fatal errors or zero records warning.');
      } else {
        backupStatus = 'VERIFIED_COMPLETE';
        console.log('  🎉 VALIDATION PASSED: All records verified complete and match device counters exactly!');
      }
    }

    // Write Data Files to Disk
    let fileWriteError = null;
    let checksums = {};
    let manifest = null;

    const usersFile = path.join(backupDir, 'users.json');
    const attFile = path.join(backupDir, 'attendance_logs.json');
    const devFile = path.join(backupDir, 'device_info.json');
    const manifestFile = path.join(backupDir, 'manifest.json');

    try {
      // Preserve 100% of raw records and original fields without any silent transformation
      const usersJson = JSON.stringify(rawUsers || [], null, 2);
      const attJson = JSON.stringify(rawLogs || [], null, 2);
      const devJson = JSON.stringify(deviceInfo || {}, null, 2);

      fs.writeFileSync(usersFile, usersJson, 'utf8');
      fs.writeFileSync(attFile, attJson, 'utf8');
      fs.writeFileSync(devFile, devJson, 'utf8');

      // If backup is NOT verified complete, write a prominent warning file in the folder
      if (backupStatus !== 'VERIFIED_COMPLETE') {
        const warningBanner = [
          '========================================================================',
          '  ⚠️ WARNING: INCOMPLETE / UNVERIFIED BACKUP EXPORT',
          '========================================================================',
          `Status  : ${backupStatus}`,
          `Errors  : ${errors.length > 0 ? errors.join('; ') : 'Count mismatch or missing data.'}`,
          '',
          'DO NOT USE OR RELY ON THIS FOLDER AS A COMPLETE OR RESTORABLE BACKUP.',
          'Data in this directory is incomplete, mismatched, or unverified.',
          '========================================================================',
        ].join('\n');
        fs.writeFileSync(path.join(backupDir, 'INCOMPLETE_BACKUP_DO_NOT_USE.txt'), warningBanner, 'utf8');
      }

      // Cryptographic SHA-256 Checksums
      checksums = {
        'users.json': calculateSha256(usersJson),
        'attendance_logs.json': calculateSha256(attJson),
        'device_info.json': calculateSha256(devJson),
      };

      // Write Complete Manifest
      manifest = {
        backupId: path.basename(backupDir),
        timestamp: new Date().toISOString(),
        isVerifiedCompleteBackup: backupStatus === 'VERIFIED_COMPLETE',
        status: backupStatus,
        device: {
          ip,
          port,
          protocol: 'tcp',
        },
        library: {
          name: 'node-zklib',
          lockedVersion: '1.3.0',
        },
        readOnlyGuarantee: {
          clearCommandExecuted: false,
          eraseCommandExecuted: false,
          deviceMemoryModified: false,
        },
        biometricScope: {
          biometricTemplatesBackedUp: false,
          scopeNote: 'Only text attendance punch logs and user profile metadata (uid, userId, name, role, cardno) are extracted. Physical fingerprint minutiae templates are NOT extracted by node-zklib.',
        },
        sensitiveDataNotice: 'User records contain raw device fields including card numbers and device passwords. Store this directory securely with restricted filesystem access.',
        deviceCounters: {
          reportedUsers: expectedUsersCount ?? null,
          reportedAttendanceLogs: expectedLogsCount ?? null,
          logCapacity: deviceInfo?.logCapacity ?? null,
        },
        extractedCounters: {
          usersCount: extractedUsersCount,
          attendanceLogsCount: extractedLogsCount,
        },
        validation: {
          userCountMatch,
          logCountMatch,
          hasPacketErrors: hasIncompletePacketError,
          hasMissingDataArray,
        },
        checksums,
        errors,
      };

      fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2), 'utf8');
    } catch (writeErr) {
      fileWriteError = writeErr;
      backupStatus = 'FILE_WRITE_ERROR';
      const msg = `File writing or manifest generation failed: ${writeErr.message}`;
      console.error(`  ❌ ${msg}`);
      errors.push(msg);
    }

    if (fileWriteError) {
      return {
        success: false,
        status: 'FILE_WRITE_ERROR',
        backupDir,
        extractedUsersCount,
        extractedLogsCount,
        deviceCounters: deviceInfo,
        errors,
      };
    }

    console.log('\n📄 Backup Artifacts Generated:');
    console.log(`  • ${path.basename(usersFile)} (${extractedUsersCount} records, sha256: ${checksums['users.json']?.slice(0, 12)}...)`);
    console.log(`  • ${path.basename(attFile)} (${extractedLogsCount} records, sha256: ${checksums['attendance_logs.json']?.slice(0, 12)}...)`);
    console.log(`  • ${path.basename(devFile)}`);
    if (backupStatus !== 'VERIFIED_COMPLETE') {
      console.log(`  • INCOMPLETE_BACKUP_DO_NOT_USE.txt [WARNING BANNER GENERATED]`);
    }
    console.log(`  • ${path.basename(manifestFile)} [STATUS: ${backupStatus}]`);

    return {
      success: backupStatus === 'VERIFIED_COMPLETE',
      status: backupStatus,
      backupDir,
      extractedUsersCount,
      extractedLogsCount,
      deviceCounters: deviceInfo,
      manifest,
      errors,
    };
  } finally {
    if (socketConnected && zk && typeof zk.disconnect === 'function') {
      try {
        console.log('\n🔌 Safely disconnecting TCP socket from device...');
        await zk.disconnect();
        console.log('  ✅ Socket cleanly disconnected.');
      } catch (discErr) {
        console.warn(`  ⚠️ Disconnect notice: ${discErr.message}`);
      }
    }
  }
}

/**
 * Hardware Counters Query ONLY (Read-Only getInfo Mode)
 * 
 * Strictly connects via TCP, queries getInfo(), reports device hardware counters,
 * and disconnects.
 * 
 * Guarantees:
 * - DOES NOT call getUsers()
 * - DOES NOT call getAttendances()
 * - DOES NOT create directories or write files to disk
 * 
 * @param {Object} options
 * @param {Object} [options.zkClient] - Optional injected client for testing/mocking
 * @param {string} [options.deviceIp]
 * @param {number} [options.devicePort]
 * @returns {Promise<Object>} { success: boolean, deviceInfo: Object|null, errors: Array }
 */
async function queryDeviceInfo(options = {}) {
  const ip = options.deviceIp || DEFAULT_CONFIG.deviceIp;
  const port = options.devicePort || DEFAULT_CONFIG.devicePort;

  console.log('================================================================');
  console.log('  🔍 ZKTeco K60 Hardware Counter Query (INFO-ONLY MODE)');
  console.log(`  Target Device : ${ip}:${port} (TCP)`);
  console.log(`  Timestamp     : ${new Date().toISOString()}`);
  console.log('  Mode          : Read-only hardware counter query ONLY (no extraction)');
  console.log('================================================================');

  let zk = options.zkClient;
  if (!zk) {
    const ZKLib = require('node-zklib');
    zk = new ZKLib(ip, port, DEFAULT_CONFIG.timeoutMs, DEFAULT_CONFIG.inport);
  }

  let socketConnected = false;
  let deviceInfo = null;
  const errors = [];

  try {
    console.log('\n[1/2] 🔌 Connecting to device via TCP port 4370...');
    await zk.createSocket();
    socketConnected = true;
    console.log('  ✅ Connection established successfully.');

    console.log('\n[2/2] 📊 Querying device hardware counters (CMD_GET_FREE_SIZES)...');
    deviceInfo = await zk.getInfo();

    console.log('  ✅ Device Hardware Counters:');
    console.log(`     • User count on device    : ${deviceInfo.userCounts ?? 'Unknown'}`);
    console.log(`     • Attendance logs count   : ${deviceInfo.logCounts ?? 'Unknown'}`);
    console.log(`     • Device log capacity     : ${deviceInfo.logCapacity ?? 'Unknown'}`);

    return {
      success: true,
      deviceInfo,
      errors: [],
    };
  } catch (err) {
    const msg = `Hardware counter query failed: ${err.message}`;
    console.error(`  ❌ ${msg}`);
    errors.push(msg);
    return {
      success: false,
      deviceInfo: null,
      errors,
    };
  } finally {
    if (socketConnected && zk && typeof zk.disconnect === 'function') {
      try {
        console.log('\n🔌 Safely disconnecting TCP socket from device...');
        await zk.disconnect();
        console.log('  ✅ Socket cleanly disconnected.');
      } catch (discErr) {
        console.warn(`  ⚠️ Disconnect notice: ${discErr.message}`);
      }
    }
  }
}

// CLI Execution Entrypoint
if (require.main === module) {
  const args = process.argv.slice(2);
  const isMock = args.includes('--mock');
  const isInfoOnly = args.includes('--info-only');
  const isConfirmExtraction = args.includes('--confirm-extraction');

  if (isInfoOnly) {
    // Mode 1: Info Only (Strictly queries getInfo and disconnects)
    if (isMock) {
      console.log('🧪 Running --info-only in MOCK test mode...');
      const mockZk = {
        async createSocket() { return true; },
        async getInfo() { return { userCounts: 35, logCounts: 1420, logCapacity: 100000 }; },
        async disconnect() { return true; },
      };
      queryDeviceInfo({ zkClient: mockZk })
        .then((res) => {
          console.log('\n🏁 Mock info query completed with success:', res.success);
          process.exit(res.success ? 0 : 1);
        })
        .catch((err) => {
          console.error('Fatal mock info query error:', err);
          process.exit(1);
        });
    } else {
      queryDeviceInfo()
        .then((res) => {
          if (res.success) {
            console.log('\n✅ Hardware counter query finished successfully.');
            process.exit(0);
          } else {
            console.error('\n❌ Hardware counter query failed.');
            process.exit(1);
          }
        })
        .catch((err) => {
          console.error('Fatal query error:', err);
          process.exit(1);
        });
    }
  } else if (isConfirmExtraction) {
    // Mode 2: Full Extraction (Requires explicit --confirm-extraction flag)
    if (isMock) {
      console.log('🧪 Running full backup in MOCK test mode (no physical device access)...');
      const mockZk = {
        async createSocket() { return true; },
        async getInfo() { return { userCounts: 10, logCounts: 50, logCapacity: 100000 }; },
        async getUsers() {
          const users = Array.from({ length: 10 }, (_, i) => ({
            uid: i + 1,
            userId: String(100 + i),
            name: `User ${i + 1}`,
            role: 0,
          }));
          return { data: users, err: null };
        },
        async getAttendances(cb) {
          if (cb) cb(50, 50);
          const logs = Array.from({ length: 50 }, (_, i) => ({
            deviceUserId: String(100 + (i % 10)),
            recordTime: new Date(Date.now() - i * 3600000).toISOString(),
            ip: '192.168.0.134',
          }));
          return { data: logs, err: null };
        },
        async disconnect() { return true; },
      };

      runBackup({ zkClient: mockZk })
        .then((res) => {
          console.log('\n🏁 Mock backup completed with result:', res.status);
          process.exit(res.success ? 0 : 1);
        })
        .catch((err) => {
          console.error('Fatal mock backup error:', err);
          process.exit(1);
        });
    } else {
      runBackup()
        .then((res) => {
          if (!res.success) {
            console.error(`\n❌ Backup finished with status: ${res.status}. NOT all records could be verified.`);
            process.exit(1);
          } else {
            console.log(`\n🎉 Backup successfully verified! Status: ${res.status}`);
            process.exit(0);
          }
        })
        .catch((err) => {
          console.error('Fatal backup error:', err);
          process.exit(1);
        });
    }
  } else if (isMock) {
    // Mode 3: Standalone Mock Backup test
    console.log('🧪 Running backup in MOCK test mode (no physical device access)...');
    const mockZk = {
      async createSocket() { return true; },
      async getInfo() { return { userCounts: 10, logCounts: 50, logCapacity: 100000 }; },
      async getUsers() {
        const users = Array.from({ length: 10 }, (_, i) => ({
          uid: i + 1,
          userId: String(100 + i),
          name: `User ${i + 1}`,
          role: 0,
        }));
        return { data: users, err: null };
      },
      async getAttendances(cb) {
        if (cb) cb(50, 50);
        const logs = Array.from({ length: 50 }, (_, i) => ({
          deviceUserId: String(100 + (i % 10)),
          recordTime: new Date(Date.now() - i * 3600000).toISOString(),
          ip: '192.168.0.134',
        }));
        return { data: logs, err: null };
      },
      async disconnect() { return true; },
    };

    runBackup({ zkClient: mockZk })
      .then((res) => {
        console.log('\n🏁 Mock backup completed with result:', res.status);
        process.exit(res.success ? 0 : 1);
      })
      .catch((err) => {
        console.error('Fatal mock backup error:', err);
        process.exit(1);
      });
  } else {
    // Guard against unintended execution
    console.log('⚠️ Physical device access requires an explicit command.');
    console.log('Usage:');
    console.log('  1. Hardware Counters Only (Safe read-only query):');
    console.log('     node backup_k60.js --info-only');
    console.log('  2. Full Extraction (Read-only backup of users + logs):');
    console.log('     node backup_k60.js --confirm-extraction');
    console.log('  3. Safe Mock Testing:');
    console.log('     node backup_k60.js --mock');
    console.log('     node backup_k60.js --info-only --mock');
    console.log('     node test_backup_mock.js');
    process.exit(1);
  }
}

module.exports = {
  runBackup,
  queryDeviceInfo,
  calculateSha256,
  DEFAULT_CONFIG,
};
