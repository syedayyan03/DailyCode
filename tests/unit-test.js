import assert from 'assert';
import { extractProblemSlug, verifySubmissionMatch } from '../src/utils/submissionVerifier.js';
import { calculateStreaks } from '../src/utils/streakCalculator.js';
import { validateLeetCodeUrl, slugToTitle } from '../src/utils/leetcodeValidator.js';
import { formatLocalDate, getTodayString, getYesterdayString, daysBetween } from '../src/utils/dateUtils.js';

console.log('════════════════════════════════════════════════════════════');
console.log('🧪 SUITE 1: UNIT TESTS (Pure Functions & Domain Logic)');
console.log('════════════════════════════════════════════════════════════\n');

// 1. Slug Extraction Unit Tests
console.log('▶ Testing extractProblemSlug:');
assert.strictEqual(extractProblemSlug('https://leetcode.com/problems/two-sum/'), 'two-sum');
assert.strictEqual(extractProblemSlug('https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/description/'), 'two-sum-ii-input-array-is-sorted');
assert.strictEqual(extractProblemSlug('binary-search'), 'binary-search');
assert.strictEqual(extractProblemSlug('https://leetcode.cn/problems/lru-cache'), 'lru-cache');
assert.strictEqual(extractProblemSlug(''), '');
assert.strictEqual(extractProblemSlug(null), '');
console.log('  ✓ All 6 slug extraction cases passed');

// 2. Submission Verifier Unit Tests
console.log('\n▶ Testing verifySubmissionMatch:');
const refNowMs = 1731600000000;
const refNowSec = Math.floor(refNowMs / 1000);
const todayStr = '2026-11-14';

const mockAcList = [
  {
    title: 'Two Sum II - Input Array Is Sorted',
    titleSlug: 'two-sum-ii-input-array-is-sorted',
    timestamp: refNowSec - 1800 // 30 mins ago
  },
  {
    title: 'Coin Change',
    titleSlug: 'coin-change',
    timestamp: refNowSec - (5 * 24 * 3600) // 5 days ago
  }
];

// Test 1: Recent match
const matchRes = verifySubmissionMatch(mockAcList, 'two-sum-ii-input-array-is-sorted', todayStr, 36, refNowMs);
assert.strictEqual(matchRes.matched, true);
assert.strictEqual(matchRes.matchingSubmission.titleSlug, 'two-sum-ii-input-array-is-sorted');
console.log('  ✓ Case 1: Recent accepted submission matched');

// Test 2: Expired submission (>36h old)
const expiredRes = verifySubmissionMatch(mockAcList, 'coin-change', todayStr, 24, refNowMs);
assert.strictEqual(expiredRes.matched, false);
console.log('  ✓ Case 2: Expired submission (>24h) rejected');

// Test 3: Unsolved problem
const unsolvedRes = verifySubmissionMatch(mockAcList, 'trapping-rain-water', todayStr, 36, refNowMs);
assert.strictEqual(unsolvedRes.matched, false);
console.log('  ✓ Case 3: Unsolved problem correctly rejected');

// Test 4: Empty list
const emptyRes = verifySubmissionMatch([], 'two-sum', todayStr, 36, refNowMs);
assert.strictEqual(emptyRes.matched, false);
console.log('  ✓ Case 4: Empty submissions list handled cleanly');

// 3. Streak Calculator Regression Unit Tests
console.log('\n▶ Testing Streak Calculator Integration:');
const streakRes = calculateStreaks(['2026-11-13', '2026-11-14'], '2026-11-14');
assert.strictEqual(streakRes.currentStreak, 2);
assert.strictEqual(streakRes.isCompletedToday, true);
console.log('  ✓ Streak increment confirmed');

console.log('\n✅ ALL UNIT TESTS PASSED WITH 100% SUCCESS!\n');
