import { describe, expect, it } from 'vitest';
import { createHealthService } from './healthService';

describe('createHealthService', () => {
  it('reports environment issues when required values are missing', () => {
    const service = createHealthService({
      env: {
        VITE_SUPABASE_URL: '',
        VITE_SUPABASE_ANON_KEY: '',
      },
    });

    const summary = service.getHealthSummary();

    expect(summary.ok).toBe(false);
    expect(summary.checks.environment).toBe(false);
    expect(summary.issues.length).toBeGreaterThan(0);
  });
});
