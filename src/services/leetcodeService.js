import { extractProblemSlug } from '../utils/submissionVerifier';
import { db, doc, setDoc, isFirebaseConfigured } from '../firebase/firestore';

const STORAGE_KEY_PREFIX = 'dailycode_leetcode_user';

/**
 * Get the currently linked LeetCode username for the active user
 * @param {Object} [user] - currentUser or userProfile
 * @returns {string}
 */
export function getLinkedLeetCodeUsername(user) {
  if (user?.leetcodeUsername) {
    return user.leetcodeUsername.trim();
  }

  const uid = user?.uid || 'default';
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_${uid}`);
    if (saved) return saved.trim();
  } catch (e) {}

  return '';
}

/**
 * Save the linked LeetCode username to local storage & Firestore if configured
 * @param {Object} user 
 * @param {string} username 
 */
export async function saveLinkedLeetCodeUsername(user, username) {
  const cleanUsername = (username || '').trim();
  const uid = user?.uid || 'default';

  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_${uid}`, cleanUsername);
    window.dispatchEvent(new CustomEvent('dailycode_leetcode_linked', { detail: { username: cleanUsername } }));
  } catch (e) {}

  if (isFirebaseConfigured && db && user?.uid) {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { leetcodeUsername: cleanUsername }, { merge: true });
    } catch (err) {
      console.warn('Failed to sync LeetCode username to Firestore:', err);
    }
  }

  return cleanUsername;
}

/**
 * Unlink/remove the linked LeetCode username
 * @param {Object} user 
 */
export async function unlinkLeetCodeAccount(user) {
  const uid = user?.uid || 'default';
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}_${uid}`);
    window.dispatchEvent(new CustomEvent('dailycode_leetcode_linked', { detail: { username: '' } }));
  } catch (e) {}

  if (isFirebaseConfigured && db && user?.uid) {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { leetcodeUsername: '' }, { merge: true });
    } catch (err) {}
  }
}

/**
 * Check if a LeetCode username exists on LeetCode
 * @param {string} username 
 * @returns {Promise<{exists: boolean, user?: Object, error?: string}>}
 */
export async function checkLeetCodeUser(username) {
  if (!username) {
    return { exists: false, error: 'Username is required.' };
  }

  try {
    const res = await fetch(`/api/check-leetcode-user?username=${encodeURIComponent(username.trim())}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error checking LeetCode user:', err);
    return {
      exists: false,
      error: 'Network error checking LeetCode username: ' + err.message
    };
  }
}

/**
 * Verifies if user has solved the given problem on LeetCode matching Title, Slug & Upload Date
 * @param {{
 *   username: string,
 *   leetcodeURL: string,
 *   problemSlug?: string,
 *   problemTitle?: string,
 *   challengeDate?: string,
 *   challengeUploadedAt?: string|number
 * }} params 
 * @returns {Promise<{verified: boolean, matchingSubmission?: Object, recentSubmissions?: Array, reason?: string, error?: string}>}
 */
export async function verifyLeetCodeSubmission({ 
  username, 
  leetcodeURL, 
  problemSlug, 
  problemTitle, 
  challengeDate, 
  challengeUploadedAt 
}) {
  if (!username) {
    return { verified: false, error: 'LeetCode username is required for verification.' };
  }

  const slug = problemSlug || extractProblemSlug(leetcodeURL);

  try {
    const res = await fetch('/api/verify-leetcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.trim(),
        problemSlug: slug,
        problemTitle: problemTitle || '',
        challengeDate,
        challengeUploadedAt
      })
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error verifying LeetCode submission:', err);
    return {
      verified: false,
      error: 'Network error while contacting verification service: ' + err.message
    };
  }
}
