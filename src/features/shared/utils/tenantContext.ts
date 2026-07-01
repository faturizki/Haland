export interface TenantContext {
  tenantId?: string;
  clinicId?: string;
  actorId?: string;
  role?: string;
}

export const createTenantContext = (overrides: TenantContext = {}): TenantContext => ({
  tenantId: overrides.tenantId,
  clinicId: overrides.clinicId,
  actorId: overrides.actorId,
  role: overrides.role,
});
