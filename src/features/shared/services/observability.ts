export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

export const createLogger = (): Logger => ({
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
});

export const createPerformanceTimer = () => {
  const startedAt = Date.now();
  return {
    elapsedMs: () => Date.now() - startedAt,
    stop: () => Date.now() - startedAt,
  };
};
