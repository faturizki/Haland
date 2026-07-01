import { describe, expect, it } from 'vitest';
import { createRepositoryMetrics } from './repositoryMetrics';

describe('createRepositoryMetrics', () => {
  it('records counters and latency for repository operations', () => {
    const metrics = createRepositoryMetrics();

    metrics.record('listCustomers', 12, true);
    metrics.record('createCustomer', 41, false, 'repository_error');

    const snapshot = metrics.snapshot();

    expect(snapshot).toHaveLength(2);
    expect(snapshot[0]).toMatchObject({ operation: 'listCustomers', ok: true });
    expect(snapshot[1]).toMatchObject({ operation: 'createCustomer', ok: false, errorCode: 'repository_error' });
  });
});
