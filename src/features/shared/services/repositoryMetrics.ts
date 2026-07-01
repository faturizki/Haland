export interface RepositoryMetricSnapshot {
  operation: string;
  durationMs: number;
  ok: boolean;
  errorCode?: string;
}

export interface RepositoryMetrics {
  record(operation: string, durationMs: number, ok: boolean, errorCode?: string): void;
  snapshot(): RepositoryMetricSnapshot[];
  getSummary(): {
    readCount: number;
    writeCount: number;
    deleteCount: number;
    failureRate: number;
    slowQueryCount: number;
    averageLatencyMs: number;
  };
}

export const createRepositoryMetrics = (): RepositoryMetrics => {
  const snapshots: RepositoryMetricSnapshot[] = [];

  return {
    record(operation, durationMs, ok, errorCode) {
      snapshots.push({ operation, durationMs, ok, errorCode });
      if (/^(get|list|find|read)/i.test(operation)) {
        (this as RepositoryMetrics).getSummary();
      }
    },
    snapshot() {
      return [...snapshots];
    },
    getSummary() {
      const readCount = snapshots.filter(({ operation }) => /^(get|list|find|read)/i.test(operation)).length;
      const writeCount = snapshots.filter(({ operation }) => /^(create|update|upsert|save|write)/i.test(operation)).length;
      const deleteCount = snapshots.filter(({ operation }) => /^(delete|archive|restore|remove)/i.test(operation)).length;
      const failureCount = snapshots.filter(({ ok }) => !ok).length;
      const averageLatencyMs = snapshots.length === 0 ? 0 : snapshots.reduce((total, snapshot) => total + snapshot.durationMs, 0) / snapshots.length;
      const slowQueryCount = snapshots.filter(({ durationMs }) => durationMs >= 100).length;

      return {
        readCount,
        writeCount,
        deleteCount,
        failureRate: snapshots.length === 0 ? 0 : failureCount / snapshots.length,
        slowQueryCount,
        averageLatencyMs,
      };
    },
  };
};
