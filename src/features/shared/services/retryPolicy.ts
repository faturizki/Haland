export interface RetryPolicyOptions {
  retries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  jitterFactor?: number;
  timeoutMs?: number;
  shouldRetry?: (error: unknown) => boolean;
}

export interface RetryPolicy {
  execute<T>(operation: () => Promise<T>): Promise<T>;
}

export const createRetryPolicy = (options: RetryPolicyOptions = {}): RetryPolicy => {
  const retries = options.retries ?? 0;
  const initialDelayMs = options.delayMs ?? 100;
  const backoffMultiplier = options.backoffMultiplier ?? 2;
  const jitterFactor = options.jitterFactor ?? 0.1;
  const timeoutMs = options.timeoutMs;
  const shouldRetry = options.shouldRetry ?? (() => true);

  const computeDelay = (attempt: number) => {
    const baseDelay = initialDelayMs * Math.pow(backoffMultiplier, attempt);
    const jitter = baseDelay * jitterFactor * (Math.random() > 0.5 ? 1 : -1);
    return Math.max(0, baseDelay + jitter);
  };

  return {
    async execute(operation) {
      let attempt = 0;
      let lastError: unknown;

      while (attempt <= retries) {
        try {
          const execution = operation();
          const result = timeoutMs ? await Promise.race([execution, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Operation timed out.')), timeoutMs))]) : await execution;
          return result;
        } catch (error) {
          lastError = error;
          if (attempt === retries || !shouldRetry(error)) {
            throw error;
          }
          attempt += 1;
          const delayMs = computeDelay(attempt - 1);
          if (delayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
      }

      throw lastError;
    },
  };
};

export const isTransientError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /timeout|network|temporar|rate limit|429|5\d\d/i.test(message);
};
