import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AuthUser } from '../types/portal';

const TOKEN_STORAGE_KEY = 'ptc_portal_session_token';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  token: string | null;
  login: (email: string, passcode: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  useEffect(() => {
    let active = true;
    async function checkSession() {
      try {
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch('/api/auth/me', { headers });
        if (!res.ok) {
          if (active) setUser(null);
          return;
        }
        const data = await res.json();
        if (active) {
          setUser(data.user ?? null);
          if (!data.user && token) {
            setToken(null);
            window.localStorage.removeItem(TOKEN_STORAGE_KEY);
          }
        }
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    checkSession();
    return () => {
      active = false;
    };
  }, [token]);

  const login = useCallback(async (email: string, passcode: string): Promise<AuthUser> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, passcode }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed.');
    }
    const nextToken = data.token as string | undefined;
    if (nextToken) {
      setToken(nextToken);
      try {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      } catch {
        // Ignore storage restriction
      }
    }
    setUser(data.user);
    return data.user as AuthUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } finally {
      setUser(null);
      setToken(null);
      try {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      } catch {
        // Ignore storage restriction
      }
    }
  }, [getAuthHeaders]);

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
