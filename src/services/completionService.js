import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp, 
  onSnapshot, 
  isFirebaseConfigured 
} from '../firebase/firestore';

const LOCAL_COMPLETIONS_KEY = 'dailycode_user_completions';

function getLocalUserCompletions(userId) {
  try {
    const raw = localStorage.getItem(`${LOCAL_COMPLETIONS_KEY}_${userId || 'default'}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function saveLocalUserCompletion(userId, compData) {
  const current = getLocalUserCompletions(userId);
  if (current.some(c => c.date === compData.date)) {
    return { ...compData, alreadyCompleted: true };
  }
  current.unshift(compData);
  try {
    localStorage.setItem(`${LOCAL_COMPLETIONS_KEY}_${userId || 'default'}`, JSON.stringify(current));
    window.dispatchEvent(new Event('dailycode_completions_updated'));
  } catch (e) {}
  return compData;
}

/**
 * Mark a daily challenge completed
 */
export async function markProblemCompleted(userId, problem) {
  if (!problem || !problem.date) {
    throw new Error('Invalid problem data.');
  }

  const effectiveUserId = userId || 'test-user-id';
  const date = problem.date;

  const completionData = {
    id: date,
    userId: effectiveUserId,
    problemId: problem.id || date,
    date,
    problemTitle: problem.title || 'Daily Challenge',
    completedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db && userId) {
    try {
      const compDocRef = doc(db, 'completions', userId, 'days', date);
      const existing = await getDoc(compDocRef);
      if (existing.exists()) {
        return { id: existing.id, ...existing.data(), alreadyCompleted: true };
      }
      await setDoc(compDocRef, {
        ...completionData,
        completedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore write failed, recording locally:', err);
    }
  }

  return saveLocalUserCompletion(effectiveUserId, completionData);
}

/**
 * Check if a user has completed a challenge on a specific date
 */
export async function checkIsDateCompleted(userId, dateStr) {
  if (!dateStr) return false;
  const list = await getUserCompletions(userId);
  return list.some(c => c.date === dateStr);
}

/**
 * Get all completion records for a user
 */
export async function getUserCompletions(userId) {
  const effectiveUserId = userId || 'test-user-id';

  if (isFirebaseConfigured && db && userId) {
    try {
      const daysColRef = collection(db, 'completions', userId, 'days');
      const q = query(daysColRef, orderBy('date', 'desc'));
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

  return getLocalUserCompletions(effectiveUserId);
}

/**
 * Real-time subscription to user completions
 */
export function subscribeToUserCompletions(userId, callback) {
  const effectiveUserId = userId || 'test-user-id';

  if (isFirebaseConfigured && db && userId) {
    try {
      const daysColRef = collection(db, 'completions', userId, 'days');
      const q = query(daysColRef, orderBy('date', 'desc'));

      return onSnapshot(q, (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        if (list.length > 0) {
          callback(list);
        } else {
          callback(getLocalUserCompletions(effectiveUserId));
        }
      }, (err) => {
        callback(getLocalUserCompletions(effectiveUserId));
      });
    } catch (e) {}
  }

  const notify = () => {
    callback(getLocalUserCompletions(effectiveUserId));
  };

  notify();
  window.addEventListener('dailycode_completions_updated', notify);
  return () => window.removeEventListener('dailycode_completions_updated', notify);
}
