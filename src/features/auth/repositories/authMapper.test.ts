import { describe, expect, it } from 'vitest';
import { mapProfileRow } from './authMapper';

describe('authMapper', () => {
  it('maps profile rows to user list items', () => {
    const item = mapProfileRow({
      id: 'user-1',
      username: 'owner',
      display_name: 'Owner',
      role: 'owner',
      status: 'active',
      created_at: '2024-01-01T00:00:00.000Z',
    });

    expect(item).toEqual(
      expect.objectContaining({
        id: 'user-1',
        username: 'owner',
        displayName: 'Owner',
        role: 'owner',
        status: 'active',
      }),
    );
  });
});
