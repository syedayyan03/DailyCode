import assert from 'assert';
import { extractProblemSlug, verifySubmissionMatch } from '../src/utils/submissionVerifier.js';

console.log('🧪 Starting Submission Verifier Unit Tests...\n');

// 1. Slug extraction tests
console.log('--- Testing extractProblemSlug ---');
assert.strictEqual(extractProblemSlug('https://leetcode.com/problems/two-sum/'), 'two-sum');
assert.strictEqual(extractProblemSlug('https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/description/'), 'two-sum-ii-input-array-is-sorted');
assert.strictEqual(extractProblemSlug('binary-search'), 'binary-search');
assert.strictEqual(extractProblemSlug(''), '');
console.log('✓ extractProblemSlug passed');

// 2. Submission Matching Tests
console.log('\n--- Testing verifySubmissionMatch ---');

const nowMs = 1731600000000; // Fixed reference point
const nowSec = Math.floor(nowMs / 1000);
const todayStr = '2024-11-14';

// Case A: Perfect match (solved 1 hour ago)
const sampleSubmissions = [
  {
    title: 'Two Sum II - Input Array Is Sorted',
    titleSlug: 'two-sum-ii-input-array-is-sorted',
    timestamp: nowSec - 3600 // 1 hour ago
  },
  {
    title: 'Valid Palindrome',
    titleSlug: 'valid-palindrome',
    timestamp: nowSec - 7200
  }
];

const res1 = verifySubmissionMatch(
  sampleSubmissions,
  'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
  todayStr,
  36,
  nowMs
);
assert.strictEqual(res1.matched, true);
assert.strictEqual(res1.matchingSubmission.titleSlug, 'two-sum-ii-input-array-is-sorted');
console.log('✓ Case A (Recent valid solve) passed');

// Case B: Problem solved, but 5 days ago (outside tolerance)
const oldSubmissions = [
  {
    title: 'Two Sum II - Input Array Is Sorted',
    titleSlug: 'two-sum-ii-input-array-is-sorted',
    timestamp: nowSec - (5 * 24 * 3600) // 5 days ago
  }
];

const res2 = verifySubmissionMatch(
  oldSubmissions,
  'two-sum-ii-input-array-is-sorted',
  todayStr,
  24, // 24h tolerance
  nowMs
);
assert.strictEqual(res2.matched, false);
console.log('✓ Case B (Old solve rejected) passed');

// Case C: Empty submissions list
const res3 = verifySubmissionMatch([], 'two-sum', todayStr, 36, nowMs);
assert.strictEqual(res3.matched, false);
console.log('✓ Case C (Empty list rejected) passed');

// Case D: Different problem solved
const res4 = verifySubmissionMatch(
  sampleSubmissions,
  'median-of-two-sorted-arrays',
  todayStr,
  36,
  nowMs
);
assert.strictEqual(res4.matched, false);
console.log('✓ Case D (Different problem rejected) passed');

// Case E: Case-insensitivity check
const res5 = verifySubmissionMatch(
  [{ title: 'Two Sum', titleSlug: 'Two-Sum', timestamp: nowSec - 100 }],
  'TWO-SUM',
  todayStr,
  36,
  nowMs
);
assert.strictEqual(res5.matched, true);
console.log('✓ Case E (Case insensitivity) passed');

console.log('\n🎉 ALL SUBMISSION VERIFIER UNIT TESTS PASSED! 🚀');
