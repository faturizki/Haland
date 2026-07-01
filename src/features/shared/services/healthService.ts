export interface HealthStatus {
  ok: boolean;
  checks: Record<string, boolean>;
  message: string;
  issues: string[];
}

export interface HealthServiceOptions {
  env?: Record<string, string | undefined>;
}

export const createHealthService = (options: HealthServiceOptions = {}) => ({
  getApplicationHealth(): HealthStatus {
    return {
      ok: true,
      checks: {
        application: true,
        environment: true,
      },
      message: 'Application health check passed.',
      issues: [],
    };
  },
  getHealthSummary(): HealthStatus {
    const issues: string[] = [];
    const checks: Record<string, boolean> = {
      application: true,
      environment: false,
      supabase: false,
    };

    const env = options.env ?? {};
    if (!env.VITE_SUPABASE_URL) {
      issues.push('VITE_SUPABASE_URL is missing.');
    } else {
      checks.environment = true;
    }

    if (!env.VITE_SUPABASE_ANON_KEY) {
      issues.push('VITE_SUPABASE_ANON_KEY is missing.');
    } else {
      checks.supabase = true;
    }

    return {
      ok: issues.length === 0,
      checks,
      message: issues.length === 0 ? 'Application health check passed.' : 'Application health check found issues.',
      issues,
    };
  },
});
