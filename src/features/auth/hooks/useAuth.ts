import { createContext, createElement, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppRole } from '../../shared/types';
import { useToast } from '../../shared/hooks/useToast';
import { authService } from '../services/authService';
import type { AuthSession, LoginCredentials, UserListItem } from '../types';

interface AuthContextValue {
  session: AuthSession | null;
  user: AuthSession['user'] | null;
  role: AppRole | null;
  isAuthenticated: boolean;
  users: UserListItem[];
  isLoading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => void;
  loadUsers: () => Promise<void>;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const nextSession = await authService.login(credentials);
      setSession(nextSession);
      addToast({ title: 'Signed in', description: `Welcome back, ${nextSession.user.displayName}.`, variant: 'success' });
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign-in failed.';
      addToast({ title: 'Sign-in failed', description: message, variant: 'error' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addToast, navigate]);

  const signOut = useCallback(() => {
    setSession(null);
    navigate('/auth');
  }, [navigate]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextUsers = await authService.getUsers();
      setUsers(nextUsers);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load users.';
      addToast({ title: 'User load failed', description: message, variant: 'error' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const refreshSession = useCallback(() => {
    setSession((current) => current);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      role: session?.user.role ?? null,
      isAuthenticated: Boolean(session),
      users,
      isLoading,
      signIn,
      signOut,
      loadUsers,
      refreshSession,
    }),
    [isLoading, loadUsers, refreshSession, session, signIn, signOut, users],
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
