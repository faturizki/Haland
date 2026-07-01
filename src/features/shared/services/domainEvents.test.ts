import { describe, expect, it } from 'vitest';
import { createInMemoryEventDispatcher } from './domainEvents';

describe('createInMemoryEventDispatcher', () => {
  it('dispatches events to subscribers registered for the same type', async () => {
    const dispatcher = createInMemoryEventDispatcher();
    const seen: string[] = [];

    dispatcher.subscribe('user.created', async (event) => {
      seen.push(String(event.payload?.id ?? ''));
    });

    await dispatcher.dispatch({
      type: 'user.created',
      aggregateId: 'user-1',
      occurredAt: '2026-01-01T00:00:00.000Z',
      payload: { id: 'user-1' },
    });

    expect(seen).toEqual(['user-1']);
  });
});
