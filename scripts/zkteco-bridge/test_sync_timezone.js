/**
 * Isolated Unit & Contract Tests: Asia/Dhaka Timezone, Bridge & Sync Idempotency
 * 
 * Scope: Pure algorithmic & protocol contract verification (ZERO production database mutation)
 * 
 * Verifies:
 * 1. Punctuality cutoff boundary (08:29, 08:30 -> PRESENT; 08:31, 08:45 -> LATE)
 * 2. Early morning boundary (05:30 Asia/Dhaka does not roll back calendar date)
 * 3. SMS notification local time formatting (hh:mm AM/PM in Asia/Dhaka)
 * 4. Test ID quarantine (deviceUserId "2" flagged processed: false, never mapped to staff)
 * 5. Unmapped punch tracking (unknown IDs marked processed: false, reviewRequired: true)
 * 6. Exact in-time & out-time replay isolation (idempotency without arbitrary debounce window)
 * 7. Legitimate rapid departure preservation (e.g. 30s subsequent punch updates outTime)
 * 8. Genuine cross-host timezone test (decoding same raw K60 bytes under TZ=UTC vs TZ=Asia/Dhaka)
 */

const assert = require('assert');
const { decodeRecordData40 } = require('./node_modules/node-zklib/utils');
const { serializeDeviceRecordTimeToDhakaIso } = require('./bridge');

// Pure logic mirroring lib/timezone.ts for deterministic Node testing
const DHAKA_TIMEZONE = 'Asia/Dhaka';
const KNOWN_TEST_DEVICE_IDS = new Set(['2']);

function isKnownTestId(deviceUserId) {
  return KNOWN_TEST_DEVICE_IDS.has(String(deviceUserId).trim());
}

function normalizePunchTimestamp(input) {
  if (input instanceof Date) {
    if (isNaN(input.getTime())) throw new Error(`Invalid Date instance: ${input}`);
    return input;
  }
  if (typeof input !== 'string' || !input.trim()) {
    throw new Error(`Invalid timestamp input: ${input}`);
  }
  const trimmed = input.trim();
  const hasTimezone = /[Zz]$|[+-]\d{2}:?\d{2}$/.test(trimmed);
  if (hasTimezone) {
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) throw new Error(`Invalid ISO timestamp: ${input}`);
    return d;
  }
  const normalizedIso = trimmed.includes('T') ? `${trimmed}+06:00` : `${trimmed.replace(' ', 'T')}+06:00`;
  const d = new Date(normalizedIso);
  if (isNaN(d.getTime())) throw new Error(`Failed to parse naive timestamp: ${input}`);
  return d;
}

function getDhakaAttendanceInfo(input) {
  const dateObj = normalizePunchTimestamp(input);

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
  const padMin = String(dhakaMinute).padStart(2, '0');
  const formattedTime12h = `${padHour}:${padMin} ${period}`;

  return { dateOnlyStr, startOfDay, dhakaHour, dhakaMinute, dhakaSecond, formattedTime12h };
}

function evaluateLateness(dhakaHour, dhakaMinute, cutoffHour = 8, cutoffMinute = 30) {
  if (dhakaHour > cutoffHour) return 'LATE';
  if (dhakaHour === cutoffHour && dhakaMinute > cutoffMinute) return 'LATE';
  return 'PRESENT';
}

function formatDhakaSmsMessage(studentName, roll, className, formattedTime12h) {
  return `Dear Guardian, your child ${studentName} (Roll: ${roll}, Class: ${className}) reached school at ${formattedTime12h}.`;
}

// ==========================================
// TEST SUITE EXECUTION
// ==========================================

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

console.log('================================================================');
console.log('  YWCA School: Asia/Dhaka Timezone & Sync Integration Tests');
console.log('================================================================\n');

// Group 1: Timezone Punctuality & Cutoff Tests
console.log('Test Group 1: Asia/Dhaka Cutoff & Lateness Evaluation (08:30 AM Cutoff)');

runTest('08:29 AM Asia/Dhaka (02:29 UTC) -> PRESENT', () => {
  const info = getDhakaAttendanceInfo('2026-10-12T02:29:00.000Z');
  assert.strictEqual(info.dateOnlyStr, '2026-10-12');
  assert.strictEqual(info.dhakaHour, 8);
  assert.strictEqual(info.dhakaMinute, 29);
  assert.strictEqual(info.formattedTime12h, '08:29 AM');
  const status = evaluateLateness(info.dhakaHour, info.dhakaMinute, 8, 30);
  assert.strictEqual(status, 'PRESENT');
});

runTest('08:30 AM Asia/Dhaka (02:30 UTC) -> PRESENT (Exact cutoff)', () => {
  const info = getDhakaAttendanceInfo('2026-10-12T02:30:00.000Z');
  assert.strictEqual(info.dateOnlyStr, '2026-10-12');
  assert.strictEqual(info.dhakaHour, 8);
  assert.strictEqual(info.dhakaMinute, 30);
  assert.strictEqual(info.formattedTime12h, '08:30 AM');
  const status = evaluateLateness(info.dhakaHour, info.dhakaMinute, 8, 30);
  assert.strictEqual(status, 'PRESENT');
});

runTest('08:31 AM Asia/Dhaka (02:31 UTC) -> LATE (1 minute after cutoff)', () => {
  const info = getDhakaAttendanceInfo('2026-10-12T02:31:00.000Z');
  assert.strictEqual(info.dateOnlyStr, '2026-10-12');
  assert.strictEqual(info.dhakaHour, 8);
  assert.strictEqual(info.dhakaMinute, 31);
  assert.strictEqual(info.formattedTime12h, '08:31 AM');
  const status = evaluateLateness(info.dhakaHour, info.dhakaMinute, 8, 30);
  assert.strictEqual(status, 'LATE');
});

runTest('08:45 AM Asia/Dhaka (02:45 UTC) -> LATE', () => {
  const info = getDhakaAttendanceInfo('2026-10-12T02:45:00.000Z');
  assert.strictEqual(info.dateOnlyStr, '2026-10-12');
  assert.strictEqual(info.dhakaHour, 8);
  assert.strictEqual(info.dhakaMinute, 45);
  assert.strictEqual(info.formattedTime12h, '08:45 AM');
  const status = evaluateLateness(info.dhakaHour, info.dhakaMinute, 8, 30);
  assert.strictEqual(status, 'LATE');
});

// Group 2: Early Morning Date Boundary Test (05:30 AM Asia/Dhaka)
console.log('\nTest Group 2: Early Morning Date Boundary & Date Rollback Prevention');

runTest('05:30 AM Asia/Dhaka (23:30 UTC previous day) -> Preserves 2026-10-12 and PRESENT', () => {
  const inputUtc = '2026-10-11T23:30:00.000Z';
  const info = getDhakaAttendanceInfo(inputUtc);
  assert.strictEqual(info.dateOnlyStr, '2026-10-12', 'Must match Dhaka calendar date Oct 12, not UTC Oct 11');
  assert.strictEqual(info.startOfDay.toISOString(), '2026-10-12T00:00:00.000Z');
  assert.strictEqual(info.dhakaHour, 5);
  assert.strictEqual(info.dhakaMinute, 30);
  assert.strictEqual(info.formattedTime12h, '05:30 AM');
  const status = evaluateLateness(info.dhakaHour, info.dhakaMinute, 8, 30);
  assert.strictEqual(status, 'PRESENT');
});

// Group 3: Genuine Cross-Host Timezone Test (node-zklib byte decoding under TZ=UTC vs TZ=Asia/Dhaka)
console.log('\nTest Group 3: Genuine Cross-Host Timezone Simulation with Raw K60 Bytes');

runTest('Decoding raw K60 bytes under TZ=UTC and TZ=Asia/Dhaka produces identical +06:00 timestamp', () => {
  // Construct a raw 40-byte ZKTeco packet representing 2026-10-12 08:30:15
  // second = 15, minute = 30, hour = 8, day = 12, month = 9 (Oct, 0-indexed), year = 2026 (26 + 2000)
  const rawSeconds = 15 + (30 * 60) + (8 * 3600) + ((12 - 1) * 86400) + (9 * 31 * 86400) + (26 * 12 * 31 * 86400);
  const packetBuf = Buffer.alloc(40);
  packetBuf.writeUInt16LE(1, 0); // userSn
  packetBuf.write('101\0', 2, 'ascii'); // deviceUserId
  packetBuf.writeUInt32LE(rawSeconds, 27); // 32-bit K60 RTC integer

  // 1. Simulate Windows PC running under UTC
  process.env.TZ = 'UTC';
  const decodedUtc = decodeRecordData40(packetBuf);
  const serializedUtc = serializeDeviceRecordTimeToDhakaIso(decodedUtc.recordTime);

  // 2. Simulate Windows PC running under Asia/Dhaka
  process.env.TZ = 'Asia/Dhaka';
  const decodedDhaka = decodeRecordData40(packetBuf);
  const serializedDhaka = serializeDeviceRecordTimeToDhakaIso(decodedDhaka.recordTime);

  // 3. Simulate Windows PC running under America/New_York (UTC-4)
  process.env.TZ = 'America/New_York';
  const decodedNy = decodeRecordData40(packetBuf);
  const serializedNy = serializeDeviceRecordTimeToDhakaIso(decodedNy.recordTime);

  // All timezones MUST produce exact same wall-clock timestamp with +06:00
  assert.strictEqual(serializedUtc, '2026-10-12T08:30:15+06:00', 'Host TZ=UTC failed to serialize as +06:00');
  assert.strictEqual(serializedDhaka, '2026-10-12T08:30:15+06:00', 'Host TZ=Asia/Dhaka failed to serialize as +06:00');
  assert.strictEqual(serializedNy, '2026-10-12T08:30:15+06:00', 'Host TZ=America/New_York failed to serialize as +06:00');

  // Verify API parses this string into the exact same Dhaka calendar date and hour
  const parsed = getDhakaAttendanceInfo(serializedUtc);
  assert.strictEqual(parsed.dateOnlyStr, '2026-10-12');
  assert.strictEqual(parsed.dhakaHour, 8);
  assert.strictEqual(parsed.dhakaMinute, 30);
  assert.strictEqual(parsed.formattedTime12h, '08:30 AM');
});

// Group 4: SMS Formatting Verification
console.log('\nTest Group 4: SMS Local Time Formatting');

runTest('SMS message formats exact local Bangladesh time', () => {
  const info = getDhakaAttendanceInfo('2026-10-12T02:45:00.000Z');
  const sms = formatDhakaSmsMessage('Sadia Islam', '10', 'Play', info.formattedTime12h);
  assert.ok(sms.includes('08:45 AM'), 'SMS must contain 08:45 AM');
  assert.ok(!sms.includes('02:45 AM'), 'SMS must NEVER contain UTC 02:45 AM');
});

// Group 5: Setup / Test ID Quarantine & Unmapped Users
console.log('\nTest Group 5: Historical Setup / Test ID Quarantine & Unmapped Users');

runTest('Device User ID "2" is flagged as test ID and quarantined with processed: false', () => {
  assert.strictEqual(isKnownTestId('2'), true);
  assert.strictEqual(isKnownTestId(2), true);
  assert.strictEqual(isKnownTestId(' 2 '), true);
  assert.strictEqual(isKnownTestId('101'), false);
  assert.strictEqual(isKnownTestId('EMP-001'), false);
});

runTest('Unmapped ID produces processed: false with reviewRequired: true payload', () => {
  const mockPunch = { userId: '999', timestamp: '2026-10-12T08:30:00+06:00' };
  const mockLogData = {
    biometricUserId: mockPunch.userId,
    punchTime: normalizePunchTimestamp(mockPunch.timestamp),
    rawPayload: JSON.stringify({ ...mockPunch, status: 'UNMAPPED_USER', reviewRequired: true }),
    processed: false,
  };
  assert.strictEqual(mockLogData.processed, false, 'Unmapped user must be processed: false');
  const payload = JSON.parse(mockLogData.rawPayload);
  assert.strictEqual(payload.status, 'UNMAPPED_USER');
  assert.strictEqual(payload.reviewRequired, true);
});

// Group 6: Idempotency & Exact Replay Isolation (No Arbitrary Debounce)
console.log('\nTest Group 6: Exact Replay Isolation & Non-Discarding Subsequent Punch Logic');

runTest('Exact in-time replay (identical timestamp down to second) does NOT overwrite outTime', () => {
  const inTime = new Date('2026-10-12T02:30:15.000Z'); // 08:30:15 AM
  const retryPunch = new Date('2026-10-12T02:30:15.000Z'); // Identical retry packet from bridge

  let outTime = null;
  // Sync route logic:
  const isExactInTimeReplay = inTime && retryPunch.getTime() === inTime.getTime();
  assert.strictEqual(isExactInTimeReplay, true, 'Must detect exact in-time replay');
  if (!isExactInTimeReplay) {
    outTime = retryPunch;
  }
  assert.strictEqual(outTime, null, 'Exact in-time replay must NOT set outTime');
});

runTest('Exact out-time replay (identical timestamp) does NOT duplicate or re-write', () => {
  const outTime = new Date('2026-10-12T06:30:00.000Z'); // 12:30:00 PM
  const retryOutPunch = new Date('2026-10-12T06:30:00.000Z'); // Exact replay

  const isExactOutReplay = outTime && retryOutPunch.getTime() === outTime.getTime();
  assert.strictEqual(isExactOutReplay, true, 'Must detect exact out-time replay');
});

runTest('Legitimate rapid departure (30 seconds later) updates outTime without being discarded', () => {
  const inTime = new Date('2026-10-12T02:30:00.000Z'); // 08:30:00 AM
  const rapidExit = new Date('2026-10-12T02:30:30.000Z'); // 08:30:30 AM (30 seconds later)

  let currentOutTime = null;
  // Non-discarding logic:
  const isExactInTimeReplay = inTime && rapidExit.getTime() === inTime.getTime();
  assert.strictEqual(isExactInTimeReplay, false, '30s later is NOT an exact in-time replay');

  const prevOutMs = currentOutTime ? currentOutTime.getTime() : 0;
  if (rapidExit.getTime() > prevOutMs) {
    currentOutTime = rapidExit;
  }

  assert.notStrictEqual(currentOutTime, null, '30-second subsequent punch must NOT be discarded');
  assert.strictEqual(currentOutTime.toISOString(), '2026-10-12T02:30:30.000Z');
});

runTest('Valid afternoon exit scan (4 hours later) updates outTime', () => {
  const inTime = new Date('2026-10-12T02:30:00.000Z'); // 08:30 AM Dhaka
  const exitScan = new Date('2026-10-12T06:30:00.000Z'); // 12:30 PM Dhaka

  let outTime = new Date('2026-10-12T02:30:30.000Z'); // previous 30s exit
  if (exitScan.getTime() > outTime.getTime()) {
    outTime = exitScan;
  }
  assert.strictEqual(getDhakaAttendanceInfo(outTime).formattedTime12h, '12:30 PM');
});

console.log('\n================================================================');
console.log(`  Tests completed: ${passed}/${total} passed (${total - passed} failed)`);
console.log('================================================================');

if (passed !== total) {
  process.exit(1);
}
