import { afterEach, describe, expect, it } from 'vitest';
import { clearStoredSession, readStoredSession, writeStoredSession } from './session';

describe('auth session persistence', () => {
  afterEach(() => {
    clearStoredSession();
  });

  it('returns null when there is no stored session', () => {
    expect(readStoredSession()).toBeNull();
  });

  it('persists and restores a non-expired session', () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    writeStoredSession({
      accessToken: 'token',
      expiresAt: future,
      user: {
        id: 'user-1',
        username: 'owner',
        displayName: 'Owner',
        role: 'owner',
        status: 'active',
      },
    });

    expect(readStoredSession()).toEqual(expect.objectContaining({ accessToken: 'token' }));
  });

  it('drops an expired session during restore', () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    writeStoredSession({
      accessToken: 'expired',
      expiresAt: past,
      user: {
        id: 'user-2',
        username: 'staff',
        displayName: 'Staff',
        role: 'staff',
        status: 'active',
      },
    });

    expect(readStoredSession()).toBeNull();
  });
});
