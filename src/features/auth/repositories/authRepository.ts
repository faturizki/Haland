import type { LoginCredentials, UserListItem, CreateUserPayload, ResetPinPayload, UpdateUserRolePayload, UpdateUserStatusPayload } from '../types';
import type { AuthSession } from '../types';
import type { RepositoryContext } from '../../shared/utils/repositoryContract';

export interface AuthRepository {
  login(credentials: LoginCredentials, context?: RepositoryContext): Promise<AuthSession>;
  getUsers(context?: RepositoryContext): Promise<UserListItem[]>;
  createUser(payload: CreateUserPayload, context?: RepositoryContext): Promise<{ id: string }>;
  resetPin(payload: ResetPinPayload, context?: RepositoryContext): Promise<void>;
  updateRole(payload: UpdateUserRolePayload, context?: RepositoryContext): Promise<void>;
  updateStatus(payload: UpdateUserStatusPayload, context?: RepositoryContext): Promise<void>;
}
