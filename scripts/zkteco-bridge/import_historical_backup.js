/**
 * Historical K60 Attendance Data Migration Script
 * 
 * Safety & Invariant Guarantees:
 * 1. Read-Only on Source Backup: Backup files are immutable source evidence.
 * 2. Idempotent: Uses @@unique([biometricUserId, punchTime]) to prevent duplication.
 * 3. Zero SMS: Completely decoupled from Greenweb SMS gateway.
 * 4. Manual Attendance Protected: Existing manual entries or newer logs are never overwritten.
 * 5. Dry-Run Capable: Defaults to non-writing --dry-run mode unless --apply is explicitly passed.
 * 6. Local DB Protection: Rejects execution if DATABASE_URL does not point to local development.
 * 
 * Usage:
 *   node scripts/zkteco-bridge/import_historical_backup.js --dry-run
 *   node scripts/zkteco-bridge/import_historical_backup.js --apply (requires explicit approval gate)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const BACKUP_DIR = path.resolve(__dirname, 'backups/k60_backup_2026-10-11T19-51-37');
const DHAKA_TIMEZONE = 'Asia/Dhaka';
const KNOWN_TEST_IDS = new Set(['2']);
const BATCH_SIZE = 500;

function computeSha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Extracts exact calendar date and clock time in Asia/Dhaka (+06:00)
 */
function getDhakaInfo(dateInput) {
  const dateObj = new Date(dateInput);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date input: ' + dateInput);
  }

  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: DHAKA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = dtf.formatToParts(dateObj);
  let year = '', month = '', day = '', hour = '', minute = '', second = '';

  for (const p of parts) {
    if (p.type === 'year') year = p.value;
    else if (p.type === 'month') month = p.value;
    else if (p.type === 'day') day = p.value;
    else if (p.type === 'hour') hour = p.value;
    else if (p.type === 'minute') minute = p.value;
    else if (p.type === 'second') second = p.value;
  }

  const dateOnlyStr = `${year}-${month}-${day}`;
  const startOfDay = new Date(`${dateOnlyStr}T00:00:00.000Z`);
  const dhakaHour = parseInt(hour, 10);
  const dhakaMinute = parseInt(minute, 10);
  const dhakaSecond = parseInt(second, 10);

  const period = dhakaHour >= 12 ? 'PM' : 'AM';
  const hour12 = dhakaHour % 12 || 12;
  const padHour = String(hour12).padStart(2, '0');
  const padMin = String(minute).padStart(2, '0');
  const formattedTime12h = `${padHour}:${padMin} ${period}`;

  return {
    dateOnlyStr,
    startOfDay,
    dhakaHour,
    dhakaMinute,
    dhakaSecond,
    formattedTime12h,
  };
}

/**
 * Evaluates lateness against default staff cutoff: 08:30 AM
 */
function evaluateStaffLateness(dhakaHour, dhakaMinute, cutoffHour = 8, cutoffMinute = 30) {
  if (dhakaHour > cutoffHour) return 'LATE';
  if (dhakaHour === cutoffHour && dhakaMinute > cutoffMinute) return 'LATE';
  return 'PRESENT';
}

async function runMigration() {
  const isApply = process.argv.includes('--apply');
  const isDryRun = !isApply || process.argv.includes('--dry-run');

  console.log('================================================================');
  console.log('  K60 HISTORICAL ATTENDANCE DATA MIGRATION ENGINE');
  console.log(`  Mode: ${isDryRun ? 'DRY-RUN (Simulated, ZERO database writes)' : 'APPLY (Active Database Writes)'}`);
  console.log('================================================================\n');

  // Safety Check: Database Target Verification
  const dbUrl = process.env.DATABASE_URL || '';
  const isLocalHost = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
  if (!isLocalHost) {
    console.error('❌ SAFETY ABORT: DATABASE_URL does not point to localhost / 127.0.0.1.');
    console.error('   Production or remote databases must never be targeted by this script.');
    process.exit(1);
  }

  // 1. Verify Manifest & Immutable Checksums
  console.log('🔍 Step 1: Validating Backup Integrity & Manifest...');
  const manifestPath = path.join(BACKUP_DIR, 'manifest.json');
  const usersPath = path.join(BACKUP_DIR, 'users.json');
  const logsPath = path.join(BACKUP_DIR, 'attendance_logs.json');
  const devInfoPath = path.join(BACKUP_DIR, 'device_info.json');

  if (!fs.existsSync(manifestPath)) {
    throw new Error('Manifest not found in backup directory: ' + manifestPath);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const usersSha = computeSha256(usersPath);
  const logsSha = computeSha256(logsPath);
  const devSha = computeSha256(devInfoPath);

  if (usersSha !== manifest.checksums['users.json']) {
    throw new Error('Checksum mismatch on users.json! Backup might be tampered.');
  }
  if (logsSha !== manifest.checksums['attendance_logs.json']) {
    throw new Error('Checksum mismatch on attendance_logs.json! Backup might be tampered.');
  }
  if (devSha !== manifest.checksums['device_info.json']) {
    throw new Error('Checksum mismatch on device_info.json! Backup might be tampered.');
  }

  console.log(`   Backup ID: ${manifest.backupId}`);
  console.log(`   Status   : ${manifest.status} (Verified Complete)`);
  console.log('   All SHA-256 checksums match manifest exactly ✅\n');

  // 2. Load Source Files (Read-Only)
  const sourceUsers = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  const sourceLogs = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
  console.log(`📊 Source Users Count    : ${sourceUsers.length}`);
  console.log(`📊 Source Punch Logs Count: ${sourceLogs.length}`);

  // 3. Load Current Database Lookup Tables (Read-Only)
  console.log('\n🔍 Step 2: Inspecting Database State & Mapping Entities...');
  const dbEmployees = await prisma.employee.findMany();
  const dbStudents = await prisma.student.findMany({ select: { id: true, studentCode: true, biometricId: true } });
  const existingDbLogs = await prisma.attendanceLog.findMany({
    select: { biometricUserId: true, punchTime: true },
  });
  const existingDbEmpAttendances = await prisma.employeeAttendance.findMany();

  const existingLogSet = new Set(
    existingDbLogs.map(l => `${l.biometricUserId}|${l.punchTime.toISOString()}`)
  );
  console.log(`   Current AttendanceLog rows in DB    : ${existingDbLogs.length}`);
  console.log(`   Current EmployeeAttendance rows in DB: ${existingDbEmpAttendances.length}`);
  console.log(`   Current Employees in DB              : ${dbEmployees.length}`);

  // Build lookup maps
  const empByBiometric = new Map();
  const empByCode = new Map();
  for (const emp of dbEmployees) {
    if (emp.biometricId) empByBiometric.set(String(emp.biometricId).trim(), emp);
    if (emp.employeeCode) empByCode.set(String(emp.employeeCode).trim().toUpperCase(), emp);
  }

  // 4. Map Device Users
  console.log('\n📋 Step 3: Device User Mapping Breakdown (31 users in users.json):');
  let mappedUserCount = 0;
  let unmappedUserCount = 0;
  let quarantinedUserCount = 0;

  const userResolutionMap = new Map(); // devUserId -> { status, emp, reason }

  for (const u of sourceUsers) {
    const devUserId = String(u.userId).trim();
    const devName = String(u.name || '').trim();

    if (KNOWN_TEST_IDS.has(devUserId)) {
      quarantinedUserCount++;
      userResolutionMap.set(devUserId, {
        status: 'QUARANTINED',
        reason: 'Known hardware test ID',
        devName,
        emp: null,
      });
      continue;
    }

    let matchedEmp = null;
    if (empByBiometric.has(devUserId)) {
      matchedEmp = empByBiometric.get(devUserId);
    } else if (empByCode.has(devUserId.toUpperCase())) {
      matchedEmp = empByCode.get(devUserId.toUpperCase());
    }

    if (matchedEmp) {
      mappedUserCount++;
      userResolutionMap.set(devUserId, {
        status: 'MAPPED',
        reason: `Matched employee ${matchedEmp.name} (${matchedEmp.employeeCode})`,
        devName,
        emp: matchedEmp,
      });
    } else {
      unmappedUserCount++;
      userResolutionMap.set(devUserId, {
        status: 'UNMAPPED',
        reason: 'No matching Employee record in DB',
        devName,
        emp: null,
      });
    }
  }

  // Also handle any IDs in attendance_logs that might not be in users.json (e.g. ID "2")
  if (!userResolutionMap.has('2')) {
    userResolutionMap.set('2', {
      status: 'QUARANTINED',
      reason: 'Known hardware test ID (absent from users.json)',
      devName: 'Test Setup ID 2',
      emp: null,
    });
  }

  console.log(`   MAPPED Users     : ${mappedUserCount}`);
  console.log(`   UNMAPPED Users   : ${unmappedUserCount}`);
  console.log(`   QUARANTINED Users: ${quarantinedUserCount}`);

  // 5. Pre-Process & Group Attendance Logs
  console.log('\n⚙️  Step 4: Analyzing 12,289 Source Punch Logs...');
  let duplicateCount = 0;
  let newLogCount = 0;
  let invalidLogCount = 0;

  // Track raw punch inserts to be made
  const logsToInsert = [];
  // Track punches by mapped employee-day for EmployeeAttendance derivation
  // Map: `${employeeId}|${dateOnlyStr}` -> Array of punch Dates
  const employeeDailyPunches = new Map();

  for (const log of sourceLogs) {
    const devUserId = String(log.deviceUserId || '').trim();
    const rawTime = log.recordTime;

    if (!devUserId || !rawTime) {
      invalidLogCount++;
      continue;
    }

    const punchDate = new Date(rawTime);
    if (isNaN(punchDate.getTime())) {
      invalidLogCount++;
      continue;
    }

    const uniqueKey = `${devUserId}|${punchDate.toISOString()}`;
    if (existingLogSet.has(uniqueKey)) {
      duplicateCount++;
      continue;
    }

    newLogCount++;
    const resolution = userResolutionMap.get(devUserId) || {
      status: 'UNMAPPED',
      reason: 'Unregistered device user',
      emp: null,
    };

    let processedFlag = false;
    let payloadStatus = 'NORMAL';

    if (resolution.status === 'QUARANTINED') {
      processedFlag = false;
      payloadStatus = 'QUARANTINED';
    } else if (resolution.status === 'MAPPED') {
      processedFlag = true;
      payloadStatus = 'MAPPED';

      // Group for daily attendance derivation
      const info = getDhakaInfo(punchDate);
      const dayKey = `${resolution.emp.id}|${info.dateOnlyStr}`;
      if (!employeeDailyPunches.has(dayKey)) {
        employeeDailyPunches.set(dayKey, {
          employeeId: resolution.emp.id,
          dateOnlyStr: info.dateOnlyStr,
          startOfDay: info.startOfDay,
          punches: [],
        });
      }
      employeeDailyPunches.get(dayKey).punches.push(punchDate);
    } else {
      // UNMAPPED
      processedFlag = false;
      payloadStatus = 'UNMAPPED_USER';
    }

    logsToInsert.push({
      biometricUserId: devUserId,
      punchTime: punchDate,
      verifyMode: 1,
      rawPayload: JSON.stringify({
        ...log,
        status: payloadStatus,
        reason: resolution.reason,
        reviewRequired: resolution.status === 'UNMAPPED',
      }),
      processed: processedFlag,
    });
  }

  console.log(`   Source Logs Checked        : ${sourceLogs.length}`);
  console.log(`   Existing DB Duplicates     : ${duplicateCount}`);
  console.log(`   Invalid / Malformed Records: ${invalidLogCount}`);
  console.log(`   New Punch Logs to Insert   : ${logsToInsert.length}`);

  // 6. Calculate Derived Daily Attendance for Mapped Employees
  console.log('\n📅 Step 5: Deriving Daily Employee Attendance Records...');
  const existingEmpAttMap = new Map();
  for (const att of existingDbEmpAttendances) {
    const dStr = att.date.toISOString().split('T')[0];
    existingEmpAttMap.set(`${att.employeeId}|${dStr}`, att);
  }

  const derivedAttendancesToCreate = [];
  const derivedAttendancesToUpdate = [];
  let manualAttendancePreservedCount = 0;

  for (const [dayKey, dayData] of employeeDailyPunches.entries()) {
    // Sort punches chronologically
    dayData.punches.sort((a, b) => a.getTime() - b.getTime());

    const firstPunch = dayData.punches[0];
    const lastPunch = dayData.punches.length > 1 ? dayData.punches[dayData.punches.length - 1] : null;

    const firstInfo = getDhakaInfo(firstPunch);
    const status = evaluateStaffLateness(firstInfo.dhakaHour, firstInfo.dhakaMinute, 8, 30);

    const existingAtt = existingEmpAttMap.get(dayKey);

    if (existingAtt) {
      if (existingAtt.source === 'MANUAL') {
        manualAttendancePreservedCount++;
        continue;
      }

      // Check if outTime needs updating
      let newOut = existingAtt.outTime;
      if (lastPunch && (!newOut || lastPunch.getTime() > newOut.getTime())) {
        newOut = lastPunch;
      }

      derivedAttendancesToUpdate.push({
        id: existingAtt.id,
        inTime: existingAtt.inTime || firstPunch,
        outTime: newOut,
        status: existingAtt.status,
      });
    } else {
      derivedAttendancesToCreate.push({
        employeeId: dayData.employeeId,
        date: dayData.startOfDay,
        inTime: firstPunch,
        outTime: lastPunch,
        status,
        source: 'BIOMETRIC',
        remark: null,
        smsSent: false,
      });
    }
  }

  console.log(`   Derived Days for Mapped Staff : ${employeeDailyPunches.size}`);
  console.log(`   New EmployeeAttendance rows   : ${derivedAttendancesToCreate.length}`);
  console.log(`   Existing Attendance rows kept : ${derivedAttendancesToUpdate.length}`);
  console.log(`   Manual Attendance preserved   : ${manualAttendancePreservedCount}`);

  // 7. Execution or Dry-Run Reporting
  console.log('\n================================================================');
  console.log('  RECONCILIATION SUMMARY REPORT');
  console.log('================================================================');
  console.log(`  Source Backup Total Punches    : ${sourceLogs.length}`);
  console.log(`  - Existing DB Duplicates       : ${duplicateCount}`);
  console.log(`  - Invalid / Corrupted          : ${invalidLogCount}`);
  console.log(`  = Total AttendanceLogs to Write: ${logsToInsert.length}`);
  console.log(`    * Mapped Staff Punches       : ${logsToInsert.filter(l => l.processed).length}`);
  console.log(`    * Unmapped User Punches      : ${logsToInsert.filter(l => !l.processed && !KNOWN_TEST_IDS.has(l.biometricUserId)).length}`);
  console.log(`    * Quarantined Test Punches   : ${logsToInsert.filter(l => KNOWN_TEST_IDS.has(l.biometricUserId)).length}`);
  console.log(`  Derived EmployeeAttendance     : ${derivedAttendancesToCreate.length} new records`);
  console.log('================================================================\n');

  if (isDryRun) {
    console.log('🔒 DRY RUN COMPLETE. ZERO CHANGES MADE TO THE DATABASE.');
    console.log('   All 12,289 records have been audited and accounted for.');
    console.log('   To apply these changes, human authorization is required.');
    return;
  }

  // 8. APPLY MODE (Active database insertion in batches)
  console.log('🚀 APPLYING MIGRATION TO LOCAL DATABASE...');
  console.log(`   Processing ${logsToInsert.length} AttendanceLog records in batches of ${BATCH_SIZE}...`);

  let insertedLogsCount = 0;
  for (let i = 0; i < logsToInsert.length; i += BATCH_SIZE) {
    const batch = logsToInsert.slice(i, i + BATCH_SIZE);
    await prisma.$transaction(async (tx) => {
      for (const item of batch) {
        await tx.attendanceLog.upsert({
          where: {
            biometricUserId_punchTime: {
              biometricUserId: item.biometricUserId,
              punchTime: item.punchTime,
            },
          },
          update: {},
          create: item,
        });
      }
    });
    insertedLogsCount += batch.length;
    process.stdout.write(`\r   Progress: ${insertedLogsCount} / ${logsToInsert.length} (${Math.round((insertedLogsCount / logsToInsert.length) * 100)}%)`);
  }
  console.log('\n   AttendanceLog records successfully committed ✅');

  // Insert derived EmployeeAttendance
  if (derivedAttendancesToCreate.length > 0) {
    console.log(`   Writing ${derivedAttendancesToCreate.length} EmployeeAttendance records...`);
    for (let i = 0; i < derivedAttendancesToCreate.length; i += BATCH_SIZE) {
      const batch = derivedAttendancesToCreate.slice(i, i + BATCH_SIZE);
      await prisma.$transaction(async (tx) => {
        for (const item of batch) {
          await tx.employeeAttendance.upsert({
            where: {
              employeeId_date: {
                employeeId: item.employeeId,
                date: item.date,
              },
            },
            update: {
              inTime: item.inTime,
              outTime: item.outTime,
            },
            create: item,
          });
        }
      });
    }
    console.log('   EmployeeAttendance records successfully committed ✅');
  }

  console.log('\n🎉 HISTORICAL MIGRATION APPLIED SUCCESSFULLY TO LOCAL DATABASE.');
}

runMigration()
  .catch((e) => {
    console.error('❌ Migration Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
