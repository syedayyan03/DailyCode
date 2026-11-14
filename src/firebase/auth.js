import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './config';

// Local storage keys for resilient offline/local simulation
const LOCAL_USERS_KEY = 'dailycode_local_users';
const ACTIVE_SESSION_KEY = 'dailycode_active_session';

// Initialize default mock users in localStorage if none exist
function getLocalUsers() {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) {
      const defaultUsers = [
        {
          uid: 'admin-imperial-001',
          email: 'admin@dailycode.dev',
          password: 'password123',
          displayName: 'Imperial Developer',
          photoURL: null,
          role: 'ADMIN'
        },
        {
          uid: 'user-member-002',
          email: 'member@dailycode.dev',
          password: 'password123',
          displayName: 'Royal Member',
          photoURL: null,
          role: 'USER'
        }
      ];
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveLocalUser(user) {
  try {
    const users = getLocalUsers();
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save local user:', e);
  }
}

/**
 * Sign in using Google OAuth (Firebase when configured, or seamless local demo when unconfigured)
 */
export async function signInWithGoogle() {
  if (isFirebaseConfigured && auth && googleProvider) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled. Please complete the Google sign-in popup.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup blocked by your browser. Please allow popups for this site and try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized in your Firebase Console. Please add it under Authentication > Settings > Authorized Domains.');
      } else if (error.code === 'auth/invalid-api-key') {
        throw new Error('Invalid Firebase API key. Please check your VITE_FIREBASE_API_KEY in .env.');
      }
      throw error;
    }
  }

  // Resilient fallback for local testing when Firebase credentials are not yet set
  const mockGoogleUser = {
    uid: 'google-' + Math.random().toString(36).substring(2, 9),
    displayName: 'Google Developer',
    email: 'developer.google@dailycode.dev',
    photoURL: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    providerId: 'google.com',
    role: 'ADMIN'
  };
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(mockGoogleUser));
  return mockGoogleUser;
}

/**
 * Sign up with Email and Password
 */
export async function signUpWithEmail(email, password, displayName = '') {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  if (isFirebaseConfigured && auth) {
    try {
      const res = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      if (displayName && res.user) {
        await updateProfile(res.user, { displayName });
      }
      return res.user;
    } catch (err) {
      console.error('Firebase Email SignUp Error:', err);
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('This email address is already in use. Try signing in instead.');
      } else if (err.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        throw new Error('Invalid email format.');
      }
      throw err;
    }
  }

  // Resilient Local Demo Signup
  const users = getLocalUsers();
  const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error('An account with this email already exists. Please log in.');
  }

  const newUser = {
    uid: 'local-' + Date.now().toString(36),
    email: normalizedEmail,
    password,
    displayName: displayName.trim() || normalizedEmail.split('@')[0],
    photoURL: null,
    role: normalizedEmail.includes('admin') ? 'ADMIN' : 'USER'
  };

  saveLocalUser(newUser);
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(newUser));
  return newUser;
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email, password) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error('Please enter your email address.');
  }
  if (!password) {
    throw new Error('Please enter your password.');
  }

  if (isFirebaseConfigured && auth) {
    try {
      const res = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      return res.user;
    } catch (err) {
      console.error('Firebase Email SignIn Error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password. Please verify your credentials.');
      }
      throw err;
    }
  }

  // Resilient Local Demo SignIn
  const users = getLocalUsers();
  const found = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!found || found.password !== password) {
    // Check if it's the default admin
    if (normalizedEmail === 'admin@dailycode.dev' && password === 'password123') {
      const adminUser = {
        uid: 'admin-imperial-001',
        email: 'admin@dailycode.dev',
        displayName: 'Imperial Developer',
        role: 'ADMIN'
      };
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(adminUser));
      return adminUser;
    }
    throw new Error('Invalid email or password. (Hint: Use password123 for demo accounts)');
  }

  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(found));
  return found;
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  localStorage.removeItem(ACTIVE_SESSION_KEY);
  if (isFirebaseConfigured && auth) {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
  }
}

/**
 * Subscribe to actual Firebase Auth state changes with fallback to local session
 */
export function subscribeToAuth(callback) {
  if (isFirebaseConfigured && auth) {
    return fbOnAuthStateChanged(auth, callback);
  }

  // Local storage session check
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (raw) {
      const user = JSON.parse(raw);
      callback(user);
    } else {
      callback(null);
    }
  } catch (e) {
    callback(null);
  }

  return () => {};
}
