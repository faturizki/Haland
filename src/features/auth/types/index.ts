import type { AppRole, AccountStatus } from '../../shared/types';

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  role: AppRole;
  status: AccountStatus;
}

export interface LoginCredentials {
  username: string;
  pin: string;
}

export interface UserListItem {
  id: string;
  username: string;
  displayName: string;
  role: AppRole;
  status: AccountStatus;
  createdAt: string;
}

export interface CreateUserPayload {
  username: string;
  pin: string;
  displayName: string;
  role: AppRole;
  status?: AccountStatus;
}

export interface UpdateUserRolePayload {
  userId: string;
  role: AppRole;
}

export interface ResetPinPayload {
  userId: string;
  pin: string;
}

export interface UpdateUserStatusPayload {
  userId: string;
  status: AccountStatus;
}
