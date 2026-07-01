import type { AuthRepository } from '../repositories/authRepository';
import type { LoginCredentials, UserListItem, CreateUserPayload, ResetPinPayload, UpdateUserRolePayload, UpdateUserStatusPayload } from '../types';
import type { AuthSession } from '../types';

export interface AuthUseCases {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  getUsers(): Promise<UserListItem[]>;
  createUser(payload: CreateUserPayload): Promise<{ id: string }>;
  resetPin(payload: ResetPinPayload): Promise<void>;
  updateRole(payload: UpdateUserRolePayload): Promise<void>;
  updateStatus(payload: UpdateUserStatusPayload): Promise<void>;
}

export const createAuthUseCases = (repository: AuthRepository): AuthUseCases => ({
  async login(credentials) {
    return repository.login(credentials);
  },
  async getUsers() {
    return repository.getUsers();
  },
  async createUser(payload) {
    return repository.createUser(payload);
  },
  async resetPin(payload) {
    return repository.resetPin(payload);
  },
  async updateRole(payload) {
    return repository.updateRole(payload);
  },
  async updateStatus(payload) {
    return repository.updateStatus(payload);
  },
});
