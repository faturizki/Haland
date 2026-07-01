import type { AppRole } from '../../shared/types';

export const roleHierarchy: Record<AppRole, number> = {
  owner: 4,
  doctor: 3,
  staff: 2,
  customer: 1,
};

export const canCreateUsers = (role: AppRole) => role === 'owner' || role === 'staff';
export const canManageCustomers = (role: AppRole) => role === 'owner' || role === 'staff';
export const canCreateRole = (actorRole: AppRole, targetRole: AppRole) => {
  if (actorRole === 'owner') {
    return true;
  }

  if (actorRole === 'staff') {
    return targetRole === 'customer';
  }

  return false;
};

export const canManageUsers = (role: AppRole) => role === 'owner' || role === 'staff';
export const canChangeRole = (role: AppRole) => role === 'owner';
export const canResetPin = (role: AppRole) => role === 'owner' || role === 'staff';
export const canActivateOrDeactivate = (role: AppRole) => role === 'owner';
export const canAccessDashboard = (role: AppRole) => role === 'owner' || role === 'doctor' || role === 'staff' || role === 'customer';
export const canAccessClinic = (role: AppRole) => role === 'owner' || role === 'doctor' || role === 'staff';
export const canAccessPortal = (role: AppRole) => role === 'customer';

export const isRoleHigherOrEqual = (role: AppRole, other: AppRole) => roleHierarchy[role] >= roleHierarchy[other];
