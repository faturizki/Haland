import { supabase } from '../lib/supabase';
import type { LoginCredentials, UserListItem, CreateUserPayload, ResetPinPayload, UpdateUserRolePayload, UpdateUserStatusPayload } from '../types';
import type { AuthSession } from '../types';
import type { AppRole, AccountStatus } from '../../shared/types';
import { mapProfileRow } from './authMapper';
import { toRepositoryError } from '../../shared/utils/repositoryError';
import { createRepositoryContext, type RepositoryContext } from '../../shared/utils/repositoryContract';
import { BaseRepository } from '../../shared/services/baseRepository';
import { createQueryBuilder } from '../../shared/utils/queryBuilder';

export const supabaseAuthRepository = new (class extends BaseRepository {
  async login(credentials: LoginCredentials, context: RepositoryContext = createRepositoryContext()): Promise<AuthSession> {
    const result = await this.executeWithContext('login', 'profiles', async () => {
      const { data, error } = await supabase.rpc('authenticate_profile', {
        username_input: credentials.username,
        pin_input: credentials.pin,
      });

      if (error) {
        throw toRepositoryError(error);
      }

      if (!data?.ok) {
        throw toRepositoryError(data?.reason ?? 'Authentication failed');
      }

      const profile = data.profile as Record<string, unknown>;
      return {
        accessToken: `profile:${profile.id}`,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
        user: {
          id: String(profile.id ?? ''),
          username: String(profile.username ?? ''),
          displayName: String(profile.display_name ?? ''),
          role: String(profile.role ?? 'staff') as AppRole,
          status: String(profile.status ?? 'active') as AccountStatus,
        },
      };
    }, context);

    return result.data;
  }

  async getUsers(context: RepositoryContext = createRepositoryContext()): Promise<UserListItem[]> {
    const result = await this.executeWithContext('getUsers', 'profiles', async () => {
      const querySpec = createQueryBuilder('profiles', 'id, username, display_name, role, status, created_at')
        .select(['id', 'username', 'display_name', 'role', 'status', 'created_at'])
        .tenantScope(context.clinicId ?? 'default-clinic')
        .orderBy('created_at', 'desc')
        .toSpec();
      const { data, error } = await supabase.from(querySpec.table).select(querySpec.select).order('created_at', { ascending: false });
      if (error) {
        throw toRepositoryError(error);
      }

      return (data ?? []).map((row) => mapProfileRow(row as unknown as Record<string, unknown>));
    }, context);

    return result.data;
  }

  async createUser(payload: CreateUserPayload, context: RepositoryContext = createRepositoryContext()): Promise<{ id: string }> {
    const result = await this.executeWithContext('createUser', 'profiles', async () => {
      const querySpec = createQueryBuilder('profiles', 'id')
        .tenantScope(context.clinicId ?? 'default-clinic')
        .toSpec();
      const { data, error } = await supabase.from(querySpec.table).insert({
        username: payload.username,
        pin_hash: payload.pin,
        display_name: payload.displayName,
        role: payload.role,
        status: payload.status ?? 'active',
      }).select('id').single();

      if (error) {
        throw toRepositoryError(error);
      }

      return { id: String(data?.id ?? '') };
    }, context);

    return result.data;
  }

  async resetPin(payload: ResetPinPayload, context: RepositoryContext = createRepositoryContext()): Promise<void> {
    await this.executeWithContext('resetPin', 'profiles', async () => {
      const { error } = await supabase.rpc('set_profile_pin', {
        profile_id: payload.userId,
        new_pin: payload.pin,
      });

      if (error) {
        throw toRepositoryError(error);
      }
      return undefined;
    }, context);
  }

  async updateRole(payload: UpdateUserRolePayload, context: RepositoryContext = createRepositoryContext()): Promise<void> {
    await this.executeWithContext('updateRole', 'profiles', async () => {
      const querySpec = createQueryBuilder('profiles', 'id').tenantScope(context.clinicId ?? 'default-clinic').toSpec();
      const { error } = await supabase.from(querySpec.table).update({ role: payload.role }).eq('id', payload.userId);
      if (error) {
        throw toRepositoryError(error);
      }
      return undefined;
    }, context);
  }

  async updateStatus(payload: UpdateUserStatusPayload, context: RepositoryContext = createRepositoryContext()): Promise<void> {
    await this.executeWithContext('updateStatus', 'profiles', async () => {
      const { error } = await supabase.rpc('set_profile_status', {
        profile_id: payload.userId,
        new_status: payload.status,
      });

      if (error) {
        throw toRepositoryError(error);
      }
      return undefined;
    }, context);
  }
})();
