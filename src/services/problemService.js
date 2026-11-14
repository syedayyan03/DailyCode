import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp, 
  onSnapshot, 
  isFirebaseConfigured 
} from '../firebase/firestore';
import { getTodayString } from '../utils/dateUtils';

// Local storage fallback helpers for testing mode
const LOCAL_STORAGE_KEY = 'dailycode_problems_store';

function getLocalProblems() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  const today = getTodayString();
  const initial = [
    {
      id: today,
      date: today,
      title: 'Minimum Positive Sum Subarray',
      leetcodeURL: 'https://leetcode.com/problems/minimum-positive-sum-subarray/',
      slug: 'minimum-positive-sum-subarray',
      difficulty: 'Easy',
      topic: 'Arrays & Sliding Window',
      description: 'Given an integer array nums and two integers l and r, find the minimum sum of a subarray whose size is between l and r (inclusive) and whose sum is strictly greater than 0.\n\nReturn the minimum sum of such a subarray. If no such subarray exists, return -1.'
    },
    {
      id: 'past-1',
      date: '2026-11-13',
      title: 'Two Sum II - Input Array Is Sorted',
      leetcodeURL: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
      slug: 'two-sum-ii-input-array-is-sorted',
      difficulty: 'Medium',
      topic: 'Two Pointers',
      description: 'Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.'
    }
  ];
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
  } catch (e) {}
  return initial;
}

function saveLocalProblem(problemData) {
  const problems = getLocalProblems().filter(p => p.date !== problemData.date);
  problems.unshift(problemData);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(problems));
    window.dispatchEvent(new Event('dailycode_problems_updated'));
  } catch (e) {}
  return problemData;
}

function deleteLocalProblem(dateStr) {
  const problems = getLocalProblems().filter(p => p.date !== dateStr);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(problems));
    window.dispatchEvent(new Event('dailycode_problems_updated'));
  } catch (e) {}
}

/**
 * Get challenge for today
 */
export async function getTodayChallenge() {
  const today = getTodayString();
  return getChallengeByDate(today);
}

/**
 * Get challenge by specific YYYY-MM-DD date
 */
export async function getChallengeByDate(dateStr) {
  if (!dateStr) return null;

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'problems', dateStr);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
    } catch (err) {
      console.warn(`Firestore unavailable, reading from local testing store:`, err);
    }
  }

  // Fallback to local testing storage
  const localList = getLocalProblems();
  return localList.find(p => p.date === dateStr) || null;
}

/**
 * Get all published and scheduled challenges
 */
export async function getAllChallenges() {
  if (isFirebaseConfigured && db) {
    try {
      const problemsRef = collection(db, 'problems');
      const q = query(problemsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      if (list.length > 0) return list;
    } catch (err) {
      console.warn('Firestore fetch failed, using local store:', err);
    }
  }

  return getLocalProblems();
}

/**
 * Real-time subscription to a specific date's challenge
 */
export function subscribeToChallenge(dateStr, callback) {
  if (!dateStr) {
    callback(null);
    return () => {};
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'problems', dateStr);
      return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          callback({ id: docSnap.id, ...docSnap.data() });
        } else {
          // fallback check in local store
          const localList = getLocalProblems();
          callback(localList.find(p => p.date === dateStr) || null);
        }
      }, (error) => {
        const localList = getLocalProblems();
        callback(localList.find(p => p.date === dateStr) || null);
      });
    } catch (e) {
      // use local listener
    }
  }

  // Local storage reactive subscription
  const notify = () => {
    const localList = getLocalProblems();
    const found = localList.find(p => p.date === dateStr) || null;
    callback(found);
  };

  notify();
  window.addEventListener('dailycode_problems_updated', notify);
  return () => window.removeEventListener('dailycode_problems_updated', notify);
}

/**
 * Create or update a daily challenge
 */
export async function saveChallenge(problemData) {
  const { date, title, leetcodeURL, difficulty, topic, description } = problemData;

  if (!date || !title || !leetcodeURL || !difficulty || !topic || !description) {
    throw new Error('All required challenge fields must be completed.');
  }

  const cleanData = {
    id: date,
    date,
    title: title.trim(),
    leetcodeURL: leetcodeURL.trim(),
    difficulty,
    topic: topic.trim(),
    description: description.trim(),
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'problems', date);
      const existing = await getDoc(docRef);
      await setDoc(docRef, {
        ...cleanData,
        updatedAt: serverTimestamp(),
        ...(!existing.exists() ? { createdAt: serverTimestamp() } : {})
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore write failed, saving locally:', err);
    }
  }

  return saveLocalProblem(cleanData);
}

/**
 * Delete a challenge
 */
export async function deleteChallenge(dateStr) {
  if (!dateStr) return;

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'problems', dateStr);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore delete failed, deleting locally:', err);
    }
  }

  deleteLocalProblem(dateStr);
}
