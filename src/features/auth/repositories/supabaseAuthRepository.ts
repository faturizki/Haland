import { supabase } from '../lib/supabase';
import type { LoginCredentials, UserListItem, CreateUserPayload, ResetPinPayload, UpdateUserRolePayload, UpdateUserStatusPayload } from '../types';
import type { AuthSession } from '../types';
import type { AppRole, AccountStatus } from '../../shared/types';
import { mapProfileRow } from './authMapper';
import { toRepositoryError } from '../../shared/utils/repositoryError';
import { createAuditLogger } from '../../shared/services/auditLogger';
import { createRepositoryContext, type RepositoryContext } from '../../shared/utils/repositoryContract';

const auditLogger = createAuditLogger();

export const supabaseAuthRepository = {
  async login(credentials: LoginCredentials, context: RepositoryContext = createRepositoryContext()): Promise<AuthSession> {
    const { data, error } = await supabase.rpc('authenticate_profile', {
      username_input: credentials.username,
      pin_input: credentials.pin,
    });

    if (error) {
      auditLogger.failed({ operation: 'login', correlationId: context.correlationId, resource: 'profiles', error });
      throw toRepositoryError(error);
    }

    if (!data?.ok) {
      auditLogger.failed({ operation: 'login', correlationId: context.correlationId, resource: 'profiles', error: data?.reason ?? 'Authentication failed' });
      throw toRepositoryError(data?.reason ?? 'Authentication failed');
    }

    const profile = data.profile as Record<string, unknown>;
    auditLogger.after({ operation: 'login', correlationId: context.correlationId, resource: 'profiles' });
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
  },

  async getUsers(context: RepositoryContext = createRepositoryContext()): Promise<UserListItem[]> {
    auditLogger.before({ operation: 'getUsers', correlationId: context.correlationId, resource: 'profiles' });
    const { data, error } = await supabase.from('profiles').select('id, username, display_name, role, status, created_at').order('created_at', { ascending: false });
    if (error) {
      auditLogger.failed({ operation: 'getUsers', correlationId: context.correlationId, resource: 'profiles', error });
      throw toRepositoryError(error);
    }

    auditLogger.after({ operation: 'getUsers', correlationId: context.correlationId, resource: 'profiles' });
    return (data ?? []).map(mapProfileRow);
  },

  async createUser(payload: CreateUserPayload, context: RepositoryContext = createRepositoryContext()): Promise<{ id: string }> {
    auditLogger.before({ operation: 'createUser', correlationId: context.correlationId, resource: 'profiles' });
    const { data, error } = await supabase.from('profiles').insert({
      username: payload.username,
      pin_hash: payload.pin,
      display_name: payload.displayName,
      role: payload.role,
      status: payload.status ?? 'active',
    }).select('id').single();

    if (error) {
      auditLogger.failed({ operation: 'createUser', correlationId: context.correlationId, resource: 'profiles', error });
      throw toRepositoryError(error);
    }

    auditLogger.after({ operation: 'createUser', correlationId: context.correlationId, resource: 'profiles' });
    return { id: String(data?.id ?? '') };
  },

  async resetPin(payload: ResetPinPayload, context: RepositoryContext = createRepositoryContext()): Promise<void> {
    auditLogger.before({ operation: 'resetPin', correlationId: context.correlationId, resource: 'profiles' });
    const { error } = await supabase.rpc('set_profile_pin', {
      profile_id: payload.userId,
      new_pin: payload.pin,
    });

    if (error) {
      throw toRepositoryError(error);
    }
  },

  async updateRole(payload: UpdateUserRolePayload, context: RepositoryContext = createRepositoryContext()): Promise<void> {
    auditLogger.before({ operation: 'updateRole', correlationId: context.correlationId, resource: 'profiles' });
    const { error } = await supabase.from('profiles').update({ role: payload.role }).eq('id', payload.userId);
    if (error) {
      auditLogger.failed({ operation: 'updateRole', correlationId: context.correlationId, resource: 'profiles', error });
      throw toRepositoryError(error);
    }
    auditLogger.after({ operation: 'updateRole', correlationId: context.correlationId, resource: 'profiles' });
  },

  async updateStatus(payload: UpdateUserStatusPayload, context: RepositoryContext = createRepositoryContext()): Promise<void> {
    auditLogger.before({ operation: 'updateStatus', correlationId: context.correlationId, resource: 'profiles' });
    const { error } = await supabase.rpc('set_profile_status', {
      profile_id: payload.userId,
      new_status: payload.status,
    });

    if (error) {
      auditLogger.failed({ operation: 'updateStatus', correlationId: context.correlationId, resource: 'profiles', error });
      throw toRepositoryError(error);
    }
    auditLogger.after({ operation: 'updateStatus', correlationId: context.correlationId, resource: 'profiles' });
  },
};
