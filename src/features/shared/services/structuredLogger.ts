export interface StructuredLogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

export interface StructuredLogger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

export const createStructuredLogger = (emit?: (entry: StructuredLogEntry) => void): StructuredLogger => {
  const write = emit ?? ((entry) => console.info('[haland]', JSON.stringify(entry)));

  return {
    info(message, context) {
      write({ level: 'info', message, context, timestamp: new Date().toISOString() });
    },
    warn(message, context) {
      write({ level: 'warn', message, context, timestamp: new Date().toISOString() });
    },
    error(message, context) {
      write({ level: 'error', message, context, timestamp: new Date().toISOString() });
    },
    debug(message, context) {
      write({ level: 'debug', message, context, timestamp: new Date().toISOString() });
    },
  };
};
