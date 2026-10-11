/**
 * Test Safety Guards for test_k60_punch_1200.js
 * 
 * Verifies:
 * 1. Strict localhost guard blocks non-localhost endpoints.
 * 2. Mandatory environment secret enforcement (fails if secret is missing).
 */

const assert = require('assert');
const { resolveAndValidateLocalhostUrl, getRequiredSecretToken } = require('./test_k60_punch_1200');

console.log('🧪 Starting Security Guard Verification Tests...\n');

let passedTests = 0;

// Test 1: Localhost allowed
try {
  const result = resolveAndValidateLocalhostUrl('http://localhost:3000/api/attendance/sync');
  assert.strictEqual(result, 'http://localhost:3000/api/attendance/sync');
  console.log('✅ Test 1 Passed: "http://localhost:3000/api/attendance/sync" is permitted.');
  passedTests++;
} catch (err) {
  console.error('❌ Test 1 Failed:', err.message);
}

// Test 2: 127.0.0.1 allowed
try {
  const result = resolveAndValidateLocalhostUrl('http://127.0.0.1:3000/api/attendance/sync');
  assert.strictEqual(result, 'http://127.0.0.1:3000/api/attendance/sync');
  console.log('✅ Test 2 Passed: "http://127.0.0.1:3000/api/attendance/sync" is permitted.');
  passedTests++;
} catch (err) {
  console.error('❌ Test 2 Failed:', err.message);
}

// Test 3: Default undefined URL defaults to localhost:3000
try {
  const result = resolveAndValidateLocalhostUrl(undefined);
  assert.strictEqual(result, 'http://localhost:3000/api/attendance/sync');
  console.log('✅ Test 3 Passed: Undefined target defaults strictly to localhost:3000.');
  passedTests++;
} catch (err) {
  console.error('❌ Test 3 Failed:', err.message);
}

// Test 4: External VPS domain is strictly BLOCKED
try {
  resolveAndValidateLocalhostUrl('https://ywca.codenextit.com/api/attendance/sync');
  console.error('❌ Test 4 Failed: External domain should have been blocked!');
} catch (err) {
  assert(err.message.includes('SAFETY VIOLATION'));
  console.log('✅ Test 4 Passed: Production VPS domain "ywca.codenextit.com" is strictly BLOCKED with SAFETY VIOLATION.');
  passedTests++;
}

// Test 5: LAN IP target is strictly BLOCKED
try {
  resolveAndValidateLocalhostUrl('http://192.168.0.50:3000/api/attendance/sync');
  console.error('❌ Test 5 Failed: LAN IP should have been blocked!');
} catch (err) {
  assert(err.message.includes('SAFETY VIOLATION'));
  console.log('✅ Test 5 Passed: External LAN IP "192.168.0.50" is strictly BLOCKED with SAFETY VIOLATION.');
  passedTests++;
}

// Test 6: Secret token loaded from environment
try {
  const token = getRequiredSecretToken();
  assert(typeof token === 'string' && token.length > 0);
  console.log('✅ Test 6 Passed: Secret token successfully loaded from environment without printing value.');
  passedTests++;
} catch (err) {
  console.error('❌ Test 6 Failed:', err.message);
}

// Test 7: Secret token throws when missing
try {
  const originalSecret = process.env.BIOMETRIC_SYNC_SECRET;
  const originalBridge = process.env.BRIDGE_SECRET_TOKEN;
  delete process.env.BIOMETRIC_SYNC_SECRET;
  delete process.env.BRIDGE_SECRET_TOKEN;

  assert.throws(
    () => getRequiredSecretToken(),
    /Configuration Error: BIOMETRIC_SYNC_SECRET environment variable is missing/
  );

  // Restore
  process.env.BIOMETRIC_SYNC_SECRET = originalSecret;
  if (originalBridge) process.env.BRIDGE_SECRET_TOKEN = originalBridge;

  console.log('✅ Test 7 Passed: Missing environment variable immediately throws configuration error with zero fallback.');
  passedTests++;
} catch (err) {
  console.error('❌ Test 7 Failed:', err.message);
}

console.log(`\n🎉 Results: ${passedTests}/7 Security Guard tests passed successfully!`);

if (passedTests !== 7) {
  process.exit(1);
}
