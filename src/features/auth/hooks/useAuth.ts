import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppRole } from '../../shared/types';
import { useToast } from '../../shared/hooks/useToast';
import { createAuthUseCases } from '../application/authUseCases';
import { supabaseAuthRepository } from '../repositories/supabaseAuthRepository';
import type { AuthSession, LoginCredentials, UserListItem } from '../types';
import { clearStoredSession, readStoredSession, writeStoredSession } from '../utils/session';

interface AuthContextValue {
  session: AuthSession | null;
  user: AuthSession['user'] | null;
  role: AppRole | null;
  isAuthenticated: boolean;
  users: UserListItem[];
  isLoading: boolean;
  isBootstrapping: boolean;
  authError: string | null;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => void;
  loadUsers: () => Promise<void>;
  refreshSession: () => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const authUseCases = useMemo(() => createAuthUseCases(supabaseAuthRepository), []);

  const persistSession = useCallback((nextSession: AuthSession | null) => {
    if (nextSession) {
      writeStoredSession(nextSession);
      setSession(nextSession);
      return;
    }

    clearStoredSession();
    setSession(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = () => {
      setIsBootstrapping(true);
      const storedSession = readStoredSession();

      if (isMounted) {
        setSession(storedSession);
        setIsBootstrapping(false);
      }
    };

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const nextSession = await authUseCases.login(credentials);
      persistSession(nextSession);
      addToast({ title: 'Signed in', description: `Welcome back, ${nextSession.user.displayName}.`, variant: 'success' });
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign-in failed.';
      setAuthError(message);
      addToast({ title: 'Sign-in failed', description: message, variant: 'error' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addToast, authUseCases, navigate, persistSession]);

  const signOut = useCallback(() => {
    persistSession(null);
    setUsers([]);
    setAuthError(null);
    navigate('/auth');
  }, [navigate, persistSession]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextUsers = await authUseCases.getUsers();
      setUsers(nextUsers);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load users.';
      setAuthError(message);
      addToast({ title: 'User load failed', description: message, variant: 'error' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addToast, authUseCases]);

  const refreshSession = useCallback(() => {
    const storedSession = readStoredSession();
    persistSession(storedSession);
  }, [persistSession]);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      role: session?.user.role ?? null,
      isAuthenticated: Boolean(session),
      users,
      isLoading,
      isBootstrapping,
      authError,
      signIn,
      signOut,
      loadUsers,
      refreshSession,
      clearAuthError,
    }),
    [authError, clearAuthError, isBootstrapping, isLoading, loadUsers, refreshSession, session, signIn, signOut, users],
  );

  return createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
