import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onIdTokenChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseConfigured, getFirebaseAuth } from '../lib/firebase';
import type { AuthUser } from '../types/portal';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    let active = true;
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        if (active) {
          setUser(null);
          setToken(null);
          setLoading(false);
        }
        return;
      }

      try {
        const nextToken = await firebaseUser.getIdToken();
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${nextToken}` },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Unable to verify your Firebase account with the portal.');
        }
        if (!data.user) {
          await signOut(auth);
          throw new Error(
            'This Firebase account must have a verified email and an assigned UID for a PTC organization or CESSCA.'
          );
        }
        if (active) {
          setToken(nextToken);
          setUser(data.user as AuthUser);
        }
      } catch (error) {
        if (active) {
          setUser(null);
          setToken(null);
        }
        console.error('Firebase session verification failed:', error);
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const auth = getFirebaseAuth();
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const nextToken = await credential.user.getIdToken();
    const response = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${nextToken}` },
    });
    const data = await response.json();

    if (!response.ok || !data.user) {
      await signOut(auth);
      throw new Error(
        data.error ||
          'This Firebase account must have a verified email and an assigned UID for a PTC organization or CESSCA.'
      );
    }

    const authenticatedUser = data.user as AuthUser;
    setToken(nextToken);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const logout = useCallback(async () => {
    if (firebaseConfigured) {
      await signOut(getFirebaseAuth());
    }
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, token, login, logout, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
