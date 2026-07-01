export interface AuditLogEvent {
  event: 'before' | 'after' | 'failed';
  operation: string;
  correlationId?: string;
  resource?: string;
  error?: unknown;
  metadata?: Record<string, unknown>;
}

export interface AuditLoggerOptions {
  emit?: (event: AuditLogEvent) => void;
}

export const createAuditLogger = (options: AuditLoggerOptions = {}) => ({
  before(payload: Omit<AuditLogEvent, 'event'>) {
    options.emit?.({ event: 'before', ...payload });
  },
  after(payload: Omit<AuditLogEvent, 'event'>) {
    options.emit?.({ event: 'after', ...payload });
  },
  failed(payload: Omit<AuditLogEvent, 'event'>) {
    options.emit?.({ event: 'failed', ...payload });
  },
});
