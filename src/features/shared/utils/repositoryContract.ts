import type { TenantContext } from './tenantContext';

export interface RepositoryContext {
  tenant?: TenantContext;
  correlationId?: string;
}

export const createRepositoryContext = (overrides: RepositoryContext = {}): RepositoryContext => ({
  tenant: overrides.tenant,
  correlationId: overrides.correlationId,
});
