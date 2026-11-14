import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser, 
  subscribeToAuth 
} from '../firebase/auth';
import { syncUserProfile } from '../services/userService';

const AuthContext = createContext(null);

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

// Inactivity threshold: 3 days in milliseconds (72 hours)
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to touch & refresh activity timestamp
  const recordActivity = useCallback(() => {
    try {
      localStorage.setItem('dailycode_last_active', Date.now().toString());
    } catch (e) {
      console.warn('Failed to record activity timestamp:', e);
    }
  }, []);

  // Check if session has exceeded 3 days of inactivity
  const isSessionExpired = useCallback(() => {
    try {
      const lastActiveStr = localStorage.getItem('dailycode_last_active');
      if (!lastActiveStr) return true; // No activity timestamp found -> session expired
      const lastActive = parseInt(lastActiveStr, 10);
      if (isNaN(lastActive)) return true;
      const elapsed = Date.now() - lastActive;
      return elapsed > THREE_DAYS_MS;
    } catch (e) {
      return true;
    }
  }, []);

  // Complete session purge (used on logout, expiry, or invalid session)
  const purgeSession = useCallback(() => {
    try {
      localStorage.removeItem('dailycode_active_session');
      localStorage.removeItem('dailycode_last_active');
    } catch (e) {}
    setCurrentUser(null);
    setUserProfile(null);
  }, []);

  // Initialize session state on mount
  useEffect(() => {
    let isMounted = true;

    // Check if session is expired due to 3-day inactivity threshold
    if (isSessionExpired()) {
      purgeSession();
      setLoading(false);
      return;
    }

    // Hydrate existing valid session within 3 days
    try {
      const savedSession = localStorage.getItem('dailycode_active_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        // Exclude old temporary test-admin-id mocks
        if (parsed && parsed.uid && parsed.uid !== 'test-admin-id') {
          setCurrentUser(parsed);
          setUserProfile(parsed);
          recordActivity(); // Refresh activity window on visit
        } else {
          purgeSession();
        }
      }
    } catch (e) {
      console.warn('Session hydration error:', e);
      purgeSession();
    }

    const unsubscribe = subscribeToAuth(async (authUser) => {
      if (!isMounted) return;

      if (authUser) {
        if (isSessionExpired()) {
          purgeSession();
          setLoading(false);
          return;
        }

        try {
          const profile = await syncUserProfile(authUser);
          setCurrentUser(authUser);
          setUserProfile(profile || authUser);
          recordActivity();
          localStorage.setItem('dailycode_active_session', JSON.stringify(profile || authUser));
        } catch (err) {
          console.warn('Profile sync fallback:', err);
          setCurrentUser(authUser);
          setUserProfile(authUser);
          recordActivity();
        }
      } else {
        const savedSession = localStorage.getItem('dailycode_active_session');
        if (!savedSession || isSessionExpired()) {
          purgeSession();
        }
      }
      setLoading(false);
    });

    setLoading(false);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isSessionExpired, purgeSession, recordActivity]);

  // Keep activity timestamp updated when user interacts with the app
  useEffect(() => {
    if (!currentUser) return;

    const handleUserInteraction = () => {
      recordActivity();
    };

    window.addEventListener('click', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, [currentUser, recordActivity]);

  const loginWithGoogle = async () => {
    try {
      const user = await signInWithGoogle();
      const profile = await syncUserProfile(user);
      const activeData = profile || user;
      setCurrentUser(user);
      setUserProfile(activeData);
      recordActivity();
      localStorage.setItem('dailycode_active_session', JSON.stringify(activeData));
      return { user, profile: activeData };
    } catch (error) {
      console.error('Google Login Error:', error);
      throw error;
    }
  };

  const loginWithEmailUser = async (email, password) => {
    try {
      const user = await signInWithEmail(email, password);
      const profile = await syncUserProfile(user);
      const activeData = profile || user;
      setCurrentUser(user);
      setUserProfile(activeData);
      recordActivity();
      localStorage.setItem('dailycode_active_session', JSON.stringify(activeData));
      return { user, profile: activeData };
    } catch (error) {
      console.error('Email Login Error:', error);
      throw error;
    }
  };

  const signupWithEmailUser = async (email, password, displayName) => {
    try {
      const user = await signUpWithEmail(email, password, displayName);
      const profile = await syncUserProfile(user);
      const activeData = profile || user;
      setCurrentUser(user);
      setUserProfile(activeData);
      recordActivity();
      localStorage.setItem('dailycode_active_session', JSON.stringify(activeData));
      return { user, profile: activeData };
    } catch (error) {
      console.error('Email Signup Error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    purgeSession();
  };

  const promoteToAdmin = async () => {
    setUserProfile(prev => {
      const updated = { ...(prev || {}), role: 'ADMIN' };
      localStorage.setItem('dailycode_active_session', JSON.stringify(updated));
      return updated;
    });
  };

  const userEmail = (currentUser?.email || '').toLowerCase();
  const isAdmin = userProfile?.role === 'ADMIN' || 
                  ADMIN_EMAILS.includes(userEmail) || 
                  userEmail === 'admin@dailycode.dev' ||
                  userEmail === 'shadeedshaik1@gmail.com';

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    role: isAdmin ? 'ADMIN' : (userProfile?.role || 'USER'),
    loading,
    loginWithGoogle,
    loginWithEmail: loginWithEmailUser,
    signupWithEmail: signupWithEmailUser,
    logout,
    promoteToAdmin,
    recordActivity
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
