import { createRepositoryContext, validateRepositoryContext, type RepositoryContext, type RepositoryQuery, type RepositoryResult } from '../utils/repositoryContract';
import { toRepositoryError } from '../utils/repositoryError';
import { createAuditLogger } from './auditLogger';
import { createStructuredLogger } from './structuredLogger';
import { createRepositoryMetrics } from './repositoryMetrics';
import { createRetryPolicy } from './retryPolicy';
import { createTraceContext } from './traceContext';
import { createPerformanceTimer } from './observability';

const auditLogger = createAuditLogger();
const structuredLogger = createStructuredLogger();
const repositoryMetrics = createRepositoryMetrics();
const retryPolicy = createRetryPolicy({ retries: 1, delayMs: 25 });

export abstract class BaseRepository {
  protected readonly logger = structuredLogger;
  protected readonly metrics = repositoryMetrics;
  protected readonly audit = auditLogger;

  protected async executeWithContext<T>(
    operation: string,
    resource: string,
    run: () => Promise<T>,
    context: RepositoryContext = {},
  ): Promise<RepositoryResult<T>> {
    const startedAt = Date.now();
    const timer = createPerformanceTimer();
    const effectiveContext = validateRepositoryContext(context.requestId || context.traceId || context.correlationId ? context : createRepositoryContext(context));
    const traceContext = createTraceContext({
      requestId: effectiveContext.requestId,
      traceId: effectiveContext.traceId,
      correlationId: effectiveContext.correlationId,
      operation,
    });

    this.audit.before({ operation, correlationId: effectiveContext.correlationId, resource });
    this.logger.info(`Repository ${operation} started`, {
      resource,
      clinicId: effectiveContext.clinicId,
      userId: effectiveContext.userId,
      role: effectiveContext.role,
      requestId: effectiveContext.requestId,
      traceId: effectiveContext.traceId,
      correlationId: effectiveContext.correlationId,
      traceContext,
      durationMs: timer.elapsedMs(),
    });

    try {
      const data = await retryPolicy.execute(async () => Promise.resolve(run()));
      this.audit.after({ operation, correlationId: effectiveContext.correlationId, resource });
      this.metrics.record(operation, Date.now() - startedAt, true);

      return {
        data,
        metadata: {
          resource,
          operation,
          clinicId: effectiveContext.clinicId,
          userId: effectiveContext.userId,
          role: effectiveContext.role,
          requestId: effectiveContext.requestId,
          traceId: effectiveContext.traceId,
        },
      };
    } catch (error) {
      const repositoryError = toRepositoryError(error);
      this.audit.failed({ operation, correlationId: effectiveContext.correlationId, resource, error: repositoryError });
      this.logger.error(`Repository ${operation} failed`, {
        resource,
        error: repositoryError.message,
        clinicId: effectiveContext.clinicId,
        userId: effectiveContext.userId,
        role: effectiveContext.role,
        requestId: effectiveContext.requestId,
        traceId: effectiveContext.traceId,
        correlationId: effectiveContext.correlationId,
        traceContext,
        durationMs: timer.elapsedMs(),
      });
      this.metrics.record(operation, Date.now() - startedAt, false, repositoryError.code);
      throw repositoryError;
    }
  }

  protected createQuery(resource: string): RepositoryQuery {
    return {
      table: resource,
      select: '*',
      filters: [],
      pagination: undefined,
      cursor: undefined,
      projection: undefined,
      search: undefined,
      range: undefined,
      includeRelations: [],
      selectFields: []
    };
  }
}
