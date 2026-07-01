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

  it('exposes readiness details for application and repository dependencies', () => {
    const service = createHealthService({
      env: {
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'anon',
      },
    });

    const readiness = service.getReadinessSummary();

    expect(readiness.ok).toBe(true);
    expect(readiness.checks.application).toBe(true);
    expect(readiness.checks.repository).toBe(true);
    expect(readiness.checks.startup).toBe(true);
    expect(readiness.checks.feature).toBe(true);
    expect(readiness.checksum).toBeDefined();
  });
});
