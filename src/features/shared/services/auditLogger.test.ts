import { describe, expect, it } from 'vitest';
import { createAuditLogger, type AuditLogEvent } from './auditLogger';

describe('createAuditLogger', () => {
  it('records before, after, and failed events with a correlation id', () => {
    const events: AuditLogEvent[] = [];
    const logger = createAuditLogger({
      emit: (event) => events.push(event),
    });

    logger.before({ operation: 'listCustomers', correlationId: 'corr-1', resource: 'customers' });
    logger.after({ operation: 'listCustomers', correlationId: 'corr-1', resource: 'customers' });
    logger.failed({ operation: 'listCustomers', correlationId: 'corr-1', resource: 'customers', error: 'boom' });

    expect(events).toHaveLength(3);
    expect(events[0]).toMatchObject({ event: 'before', correlationId: 'corr-1', resource: 'customers' });
    expect(events[2]).toMatchObject({ event: 'failed', error: 'boom' });
  });
});
