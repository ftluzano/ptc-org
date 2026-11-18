import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AuthUser } from '../types/portal';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = useCallback((): Record<string, string> => ({}), []);

  useEffect(() => {
    let active = true;
    void fetch('/api/auth/me', { credentials: 'include' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Unable to verify your portal session.');
        }
        if (active) setUser(data.user as AuthUser | null);
      })
      .catch((error: unknown) => {
        if (active) {
          setUser(null);
          console.error('Portal session verification failed:', error);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    let response: Response;
    try {
      response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
    } catch {
      throw new Error('Cannot reach the portal authentication service.');
    }

    const data: unknown = await response.json().catch(() => null);
    if (
      typeof data !== 'object' ||
      data === null ||
      !('user' in data)
    ) {
      throw new Error('The authentication service returned an invalid response.');
    }
    if (!response.ok) {
      const error = 'error' in data && typeof data.error === 'string'
        ? data.error
        : 'Unable to sign in.';
      throw new Error(error);
    }

    const authenticatedUser = data.user as AuthUser | null;
    if (!authenticatedUser) {
      throw new Error('The authentication service did not return an account.');
    }
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('The portal could not clear the sign-in cookie.');
      }
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getAuthHeaders }}>
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
