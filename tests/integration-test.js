import assert from 'assert';

console.log('════════════════════════════════════════════════════════════');
console.log('🧪 SUITE 2: INTEGRATION TESTS (API Endpoints & Network)');
console.log('════════════════════════════════════════════════════════════\n');

async function getActiveBaseUrl() {
  for (const port of [5173, 5174]) {
    try {
      const res = await fetch(`http://localhost:${port}/`);
      if (res.ok) return `http://localhost:${port}`;
    } catch (e) {}
  }
  return 'http://localhost:5173';
}

const BASE_URL = process.env.BASE_URL || await getActiveBaseUrl();

async function runIntegrationTests() {
  // Test 1: Check Valid LeetCode User via Proxy
  console.log('▶ Test 1: Querying real LeetCode user (@lee215)...');
  const userRes = await fetch(`${BASE_URL}/api/check-leetcode-user?username=lee215`);
  assert.strictEqual(userRes.status, 200, 'Endpoint must return 200');
  const userData = await userRes.json();
  assert.strictEqual(userData.exists, true);
  assert.strictEqual(userData.user.username.toLowerCase(), 'lee215');
  assert.ok(userData.user.totalSolved > 100, 'User should have solved problems');
  console.log(`  ✓ Valid user confirmed (@${userData.user.username}, ${userData.user.totalSolved} solved, ranking #${userData.user.ranking})`);

  // Test 2: Check Invalid Non-Existent LeetCode User
  console.log('\n▶ Test 2: Querying non-existent LeetCode user...');
  const fakeRes = await fetch(`${BASE_URL}/api/check-leetcode-user?username=non_existent_random_user_99999`);
  const fakeData = await fakeRes.json();
  assert.strictEqual(fakeData.exists, false);
  console.log('  ✓ Non-existent user correctly rejected with message:', fakeData.error);

  // Test 3: Verify Unsolved Submission
  console.log('\n▶ Test 3: Verifying uncompleted challenge for user...');
  const unverifiedRes = await fetch(`${BASE_URL}/api/verify-leetcode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'lee215',
      problemSlug: 'non-existent-problem-slug-xyz'
    })
  });
  const unverifiedData = await unverifiedRes.json();
  assert.strictEqual(unverifiedData.verified, false);
  assert.ok(Array.isArray(unverifiedData.recentSubmissions), 'Should return recent submissions for diagnostic display');
  console.log('  ✓ Unsolved problem rejected with reason:', unverifiedData.reason);

  // Test 4: Verify Solved Submission (Test / Demo profile)
  console.log('\n▶ Test 4: Verifying demo solved challenge simulation...');
  const demoRes = await fetch(`${BASE_URL}/api/verify-leetcode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'test_student',
      problemSlug: 'two-sum-ii-input-array-is-sorted'
    })
  });
  const demoData = await demoRes.json();
  assert.strictEqual(demoData.verified, true);
  assert.strictEqual(demoData.matchingSubmission.titleSlug, 'two-sum-ii-input-array-is-sorted');
  console.log('  ✓ Solved challenge successfully verified!');

  console.log('\n✅ ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS!\n');
}

runIntegrationTests().catch(err => {
  console.error('❌ Integration test failed:', err);
  process.exit(1);
});
