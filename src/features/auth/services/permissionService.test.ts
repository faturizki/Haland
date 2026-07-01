import { describe, expect, it } from 'vitest';
import { canCreateUsers, canManageCustomers, canCreateRole, canChangeRole, canResetPin, canActivateOrDeactivate } from './permissionService';

describe('permissionService', () => {
  it('allows owners to manage users and customers', () => {
    expect(canCreateUsers('owner')).toBe(true);
    expect(canManageCustomers('owner')).toBe(true);
    expect(canChangeRole('owner')).toBe(true);
    expect(canActivateOrDeactivate('owner')).toBe(true);
  });

  it('allows staff to create customer accounts only', () => {
    expect(canCreateUsers('staff')).toBe(true);
    expect(canManageCustomers('staff')).toBe(true);
    expect(canCreateRole('staff', 'customer')).toBe(true);
    expect(canCreateRole('staff', 'staff')).toBe(false);
    expect(canResetPin('staff')).toBe(true);
  });

  it('blocks doctors and customers from privileged actions', () => {
    expect(canCreateUsers('doctor')).toBe(false);
    expect(canManageCustomers('doctor')).toBe(false);
    expect(canChangeRole('doctor')).toBe(false);
    expect(canActivateOrDeactivate('doctor')).toBe(false);
    expect(canResetPin('customer')).toBe(false);
  });
});
