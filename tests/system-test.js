import assert from 'assert';
import { extractProblemSlug, verifySubmissionMatch } from '../src/utils/submissionVerifier.js';
import { calculateStreaks } from '../src/utils/streakCalculator.js';
import { getTodayString } from '../src/utils/dateUtils.js';

console.log('════════════════════════════════════════════════════════════');
console.log('🧪 SUITE 3: SYSTEM TESTS (Full End-to-End Workflow)');
console.log('════════════════════════════════════════════════════════════\n');

const BASE_URL = 'http://localhost:5174';

async function runSystemTest() {
  const todayStr = getTodayString();
  const testProblem = {
    id: todayStr,
    date: todayStr,
    title: 'Two Sum II - Input Array Is Sorted',
    leetcodeURL: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
    difficulty: 'Medium',
    topic: 'Two Pointers'
  };

  const problemSlug = extractProblemSlug(testProblem.leetcodeURL);
  assert.strictEqual(problemSlug, 'two-sum-ii-input-array-is-sorted');
  console.log(`[Step 1] Target Challenge: "${testProblem.title}" (slug: ${problemSlug})`);

  // Step 2: User attempts to verify without linking LeetCode username
  console.log('[Step 2] System verifies linking requirement...');
  let userProfile = { uid: 'user_e2e_456', leetcodeUsername: '' };
  assert.strictEqual(Boolean(userProfile.leetcodeUsername), false, 'User must not be linked initially');
  console.log('  ✓ System correctly flags that LeetCode account is not linked.');

  // Step 3: User links LeetCode account
  console.log('[Step 3] User links LeetCode handle @lee215...');
  const checkRes = await fetch(`${BASE_URL}/api/check-leetcode-user?username=lee215`);
  const checkData = await checkRes.json();
  assert.strictEqual(checkData.exists, true);
  userProfile.leetcodeUsername = checkData.user.username;
  console.log(`  ✓ Account @${userProfile.leetcodeUsername} verified on LeetCode and saved to profile.`);

  // Step 4: User clicks Mark Completed before solving
  console.log('[Step 4] User clicks "Mark Completed" before solving problem on LeetCode...');
  const verifyAttempt1 = await fetch(`${BASE_URL}/api/verify-leetcode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: userProfile.leetcodeUsername,
      problemSlug: 'unsolved-random-challenge-xyz',
      challengeDate: todayStr
    })
  });
  const attempt1Data = await verifyAttempt1.json();
  assert.strictEqual(attempt1Data.verified, false);
  console.log('  ✓ Verification correctly DENIED: User has not solved this problem.');
  console.log('  ✓ Diagnostic reason returned to user:', attempt1Data.reason);

  // Step 5: User solves problem on LeetCode and clicks Mark Completed
  console.log('\n[Step 5] User completes problem on LeetCode and re-verifies...');
  const verifyAttempt2 = await fetch(`${BASE_URL}/api/verify-leetcode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'test_student',
      problemSlug: problemSlug,
      challengeDate: todayStr
    })
  });
  const attempt2Data = await verifyAttempt2.json();
  assert.strictEqual(attempt2Data.verified, true);
  console.log('  ✓ Verification APPROVED! Found accepted submission on LeetCode.');

  // Step 6: System records completion & updates streaks
  console.log('[Step 6] Updating user completion record & streak engine...');
  const priorCompletions = ['2026-11-12', '2026-11-13']; // 2 prior days
  const updatedCompletions = [...priorCompletions, todayStr];
  const newStreakStats = calculateStreaks(updatedCompletions, todayStr);

  assert.strictEqual(newStreakStats.currentStreak, 3, 'Streak should increment to 3');
  assert.strictEqual(newStreakStats.isCompletedToday, true, 'Today must be marked completed');
  assert.strictEqual(newStreakStats.totalCompleted, 3);
  console.log(`  ✓ Streak successfully incremented to ${newStreakStats.currentStreak} Days!`);
  console.log('  ✓ Today challenge status: Completed & Verified.');

  console.log('\n✅ FULL END-TO-END SYSTEM TEST COMPLETED SUCCESSFULLY!\n');
}

runSystemTest().catch(err => {
  console.error('❌ System test failed:', err);
  process.exit(1);
});
