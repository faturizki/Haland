export interface ConfigValidationResult {
  ok: boolean;
  issues: string[];
}

export const validateEnvironmentConfig = (env: Record<string, string | undefined>): ConfigValidationResult => {
  const issues: string[] = [];

  if (!env.VITE_SUPABASE_URL) {
    issues.push('VITE_SUPABASE_URL is missing.');
  }

  if (!env.VITE_SUPABASE_ANON_KEY) {
    issues.push('VITE_SUPABASE_ANON_KEY is missing.');
  }

  return {
    ok: issues.length === 0,
    issues,
  };
};
