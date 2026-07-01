export interface TraceContext {
  requestId?: string;
  traceId?: string;
  correlationId?: string;
  operation?: string;
  spanId?: string;
  parentSpanId?: string;
  timestamp?: string;
}

export const createTraceContext = (overrides: TraceContext = {}): TraceContext => ({
  requestId: overrides.requestId,
  traceId: overrides.traceId,
  correlationId: overrides.correlationId,
  operation: overrides.operation,
  spanId: overrides.spanId ?? `span-${Math.random().toString(16).slice(2)}`,
  parentSpanId: overrides.parentSpanId,
  timestamp: overrides.timestamp ?? new Date().toISOString(),
});
