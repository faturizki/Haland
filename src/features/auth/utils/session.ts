import type { AuthSession } from '../types';

const SESSION_STORAGE_KEY = 'haland.auth.session';

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const getExpiry = (value: string | undefined) => {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const readStoredSession = (): AuthSession | null => {
  if (!isBrowser) {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession> & { expiresAt?: string };
    const expiresAt = parsed.expiresAt;
    if (!parsed.accessToken || !parsed.user || !expiresAt) {
      return null;
    }

    const expiry = getExpiry(expiresAt);
    if (expiry !== null && expiry <= Date.now()) {
      clearStoredSession();
      return null;
    }

    return parsed as AuthSession;
  } catch {
    clearStoredSession();
    return null;
  }
};

export const writeStoredSession = (session: AuthSession) => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredSession = () => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
};
