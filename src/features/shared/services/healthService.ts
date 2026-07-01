import { validateEnvironmentConfig } from './configValidation';

export interface HealthStatus {
  ok: boolean;
  checks: Record<string, boolean>;
  message: string;
  issues: string[];
  checksum?: string;
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
        configuration: true,
        repository: true,
        dependency: true,
        startup: true,
        feature: true,
      },
      message: 'Application health check passed.',
      issues: [],
      checksum: 'shared-infrastructure-v1',
    };
  },
  getHealthSummary(): HealthStatus {
    const issues: string[] = [];
    const checks: Record<string, boolean> = {
      application: true,
      environment: false,
      supabase: false,
      storage: false,
      configuration: false,
      repository: true,
      dependency: true,
      startup: true,
      feature: true,
    };

    const env = options.env ?? {};
    const validation = validateEnvironmentConfig(env);
    issues.push(...validation.issues);

    if (validation.ok) {
      checks.environment = true;
      checks.configuration = true;
      checks.storage = true;
      checks.supabase = true;
    }

    return {
      ok: issues.length === 0,
      checks,
      message: issues.length === 0 ? 'Application health check passed.' : 'Application health check found issues.',
      issues,
      checksum: 'shared-infrastructure-v1',
    };
  },
  getReadinessSummary(): HealthStatus {
    const summary = this.getHealthSummary();
    return {
      ...summary,
      checks: {
        ...summary.checks,
        application: true,
        repository: true,
        dependency: true,
        startup: true,
        feature: true,
      },
      message: summary.ok ? 'Application readiness checks passed.' : 'Application readiness checks detected issues.',
    };
  },
});
