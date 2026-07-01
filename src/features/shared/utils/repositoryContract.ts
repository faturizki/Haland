import type { TenantContext } from './tenantContext';

export interface RepositoryContext {
  clinicId?: string;
  userId?: string;
  role?: string;
  requestId?: string;
  traceId?: string;
  tenant?: TenantContext;
  correlationId?: string;
  timestamp?: string;
}

export interface RepositoryMetadata {
  resource: string;
  operation: string;
  clinicId?: string;
  userId?: string;
  role?: string;
  requestId?: string;
  traceId?: string;
}

export interface RepositoryOptions {
  timeoutMs?: number;
  retries?: number;
  enableAudit?: boolean;
  enableTracing?: boolean;
  enableMetrics?: boolean;
}

export interface RepositoryResult<T> {
  data: T;
  metadata?: RepositoryMetadata;
}

export interface RepositoryErrorShape {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface RepositoryTransaction {
  id: string;
  startedAt: string;
}

export interface RepositoryQuery {
  table: string;
  select: string;
  filters: RepositoryFilter[];
  sort?: RepositorySort;
  pagination?: RepositoryPagination;
  cursor?: RepositoryCursor;
  projection?: RepositoryProjection;
  search?: RepositorySearch;
  range?: RepositoryRange;
  includeRelations?: string[];
  selectFields?: string[];
  tenantScope?: string;
  softDelete?: boolean;
  optimisticLock?: RepositoryOptimisticLock;
  batch?: unknown[];
}

export interface RepositoryPagination {
  limit?: number;
  offset?: number;
}

export interface RepositoryCursor {
  token?: string;
  direction?: 'forward' | 'backward';
}

export interface RepositoryProjection {
  fields: string[];
}

export interface RepositorySearch {
  term: string;
  fields?: string[];
}

export interface RepositoryFilter {
  column: string;
  operator: 'eq' | 'isNull' | 'in' | 'contains';
  value: unknown;
}

export interface RepositorySort {
  column: string;
  direction: 'asc' | 'desc';
}

export interface RepositoryRange {
  from: number;
  to: number;
}

export interface RepositoryOptimisticLock {
  column: string;
  value: unknown;
}

export interface RepositoryAuditContext {
  resource: string;
  action: string;
  actorId?: string;
  clinicId?: string;
  metadata?: Record<string, unknown>;
}

export interface RepositoryTraceContext {
  requestId?: string;
  traceId?: string;
  correlationId?: string;
  operation: string;
}

export const createRepositoryContext = (overrides: RepositoryContext = {}): RepositoryContext => {
  const requestId = overrides.requestId ?? `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const traceId = overrides.traceId ?? requestId;

  return {
    clinicId: overrides.clinicId ?? 'default-clinic',
    userId: overrides.userId,
    role: overrides.role,
    requestId,
    traceId,
    tenant: overrides.tenant,
    correlationId: overrides.correlationId ?? traceId,
    timestamp: overrides.timestamp ?? new Date().toISOString(),
  };
};

export const validateRepositoryContext = (context: RepositoryContext = {}): RepositoryContext => {
  const normalized = createRepositoryContext(context);

  if (!normalized.clinicId) {
    throw new Error('Repository context requires clinicId.');
  }

  if (!normalized.requestId || !normalized.traceId || !normalized.correlationId) {
    throw new Error('Repository context requires requestId, traceId, and correlationId.');
  }

  return normalized;
};
