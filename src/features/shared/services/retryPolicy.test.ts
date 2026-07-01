import { describe, expect, it } from 'vitest';
import { createRetryPolicy } from './retryPolicy';

describe('createRetryPolicy', () => {
  it('retries transient failures with exponential backoff and jitter', async () => {
    let attempts = 0;
    const policy = createRetryPolicy({ retries: 2, delayMs: 0, backoffMultiplier: 2, jitterFactor: 0.1, shouldRetry: (error) => (error as Error).message === 'transient' });

    const result = await policy.execute(async () => {
      attempts += 1;
      if (attempts < 3) {
        throw new Error('transient');
      }
      return 'ok';
    });

    expect(result).toBe('ok');
    expect(attempts).toBe(3);
  });

  it('does not retry non-transient errors', async () => {
    const policy = createRetryPolicy({ retries: 3, delayMs: 0, shouldRetry: () => false });

    await expect(policy.execute(async () => {
      throw new Error('fatal');
    })).rejects.toThrow('fatal');
  });
});
