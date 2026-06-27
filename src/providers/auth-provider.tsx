'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { LoginInput, SessionUser } from '@/lib/auth/types';
import { authApi } from '@/lib/api/auth';
import { clearSession, getSessionUser, setSession } from '@/lib/auth/session';
import { clearImpersonationOrigin } from '@/lib/auth/impersonation';

interface AuthContextValue {
  user: SessionUser | null;
  ready: boolean;
  login: (input: LoginInput) => Promise<SessionUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getSessionUser());
    setReady(true);
  }, []);

  const login = async (input: LoginInput): Promise<SessionUser> => {
    clearImpersonationOrigin();
    const session = await authApi.login(input);
    setSession(session);
    setUser(session.user);
    return session.user;
  };

  const logout = () => {
    clearSession();
    setUser(null);
    window.location.href = '/login';
  };

  return <AuthContext.Provider value={{ user, ready, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
