import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp, 
  isFirebaseConfigured 
} from '../firebase/firestore';

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Synchronize user profile on login:
 * Works with Firestore if configured, or local session state.
 * 
 * @param {Object} authUser - Firebase or local auth user object
 * @returns {Promise<Object>} User document data
 */
export async function syncUserProfile(authUser) {
  if (!authUser || !authUser.uid) return null;

  const userEmail = (authUser.email || '').toLowerCase();
  const isAdminByEmail = ADMIN_EMAILS.includes(userEmail) || 
    userEmail === 'admin@dailycode.dev' || 
    userEmail === 'shadeedshaik1@gmail.com' ||
    authUser.role === 'ADMIN';

  if (!isFirebaseConfigured || !db) {
    const localProfile = {
      uid: authUser.uid,
      displayName: authUser.displayName || 'Developer',
      email: authUser.email || '',
      photoURL: authUser.photoURL || '',
      role: isAdminByEmail ? 'ADMIN' : (authUser.role || 'USER'),
      createdAt: authUser.createdAt || new Date().toISOString(),
      lastSeenAt: new Date().toISOString()
    };
    return localProfile;
  }

  try {
    const userRef = doc(db, 'users', authUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const initialRole = isAdminByEmail ? 'ADMIN' : 'USER';
      const newUserData = {
        uid: authUser.uid,
        displayName: authUser.displayName || 'Developer',
        email: authUser.email || '',
        photoURL: authUser.photoURL || '',
        role: initialRole,
        createdAt: serverTimestamp(),
        lastSeenAt: serverTimestamp()
      };
      await setDoc(userRef, newUserData);
      return { ...newUserData, createdAt: new Date(), lastSeenAt: new Date() };
    } else {
      const existingData = userSnap.data();
      let role = existingData.role || 'USER';

      // Auto-elevate if explicitly configured as admin
      if (isAdminByEmail && role !== 'ADMIN') {
        role = 'ADMIN';
      }

      await setDoc(userRef, {
        displayName: authUser.displayName || existingData.displayName || 'Developer',
        photoURL: authUser.photoURL || existingData.photoURL || '',
        lastSeenAt: serverTimestamp(),
        role
      }, { merge: true });

      return { ...existingData, role, lastSeenAt: new Date() };
    }
  } catch (err) {
    console.warn('Firestore user sync warning, using local profile fallback:', err);
    return {
      uid: authUser.uid,
      displayName: authUser.displayName || 'Developer',
      email: authUser.email || '',
      photoURL: authUser.photoURL || '',
      role: isAdminByEmail ? 'ADMIN' : 'USER'
    };
  }
}

/**
 * Explicitly promote or claim admin role for current user
 */
export async function claimAdminRole(uid) {
  if (!uid) return;
  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, { role: 'ADMIN', lastSeenAt: serverTimestamp() }, { merge: true });
    } catch (e) {
      console.warn('Firestore claimAdminRole warning:', e);
    }
  }
}

/**
 * Fetch a user profile by UID
 */
export async function getUserProfile(uid) {
  if (!uid) return null;
  if (!isFirebaseConfigured || !db) {
    try {
      const active = localStorage.getItem('dailycode_active_session');
      if (active) {
        const u = JSON.parse(active);
        if (u.uid === uid) return u;
      }
    } catch (e) {}
    return null;
  }

  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    return null;
  }
}
