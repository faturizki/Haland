import { supabase } from '../lib/supabase';
import type { LoginCredentials, UserListItem, CreateUserPayload, ResetPinPayload, UpdateUserRolePayload, UpdateUserStatusPayload } from '../types';
import type { AppRole, AccountStatus } from '../../shared/types';
import { toErrorMessage } from '../../shared/utils/error';

const mapProfileRow = (row: Record<string, unknown>): UserListItem => ({
  id: String(row.id ?? ''),
  username: String(row.username ?? ''),
  displayName: String(row.display_name ?? ''),
  role: String(row.role ?? 'staff') as AppRole,
  status: String(row.status ?? 'active') as AccountStatus,
  createdAt: String(row.created_at ?? ''),
});

export const authService = {
  async login(credentials: LoginCredentials) {
    const { data, error } = await supabase.rpc('authenticate_profile', {
      username_input: credentials.username,
      pin_input: credentials.pin,
    });

    if (error) {
      throw new Error(toErrorMessage(error));
    }

    if (!data?.ok) {
      throw new Error(data?.reason ?? 'Authentication failed');
    }

    const profile = data.profile as Record<string, unknown>;
    return {
      accessToken: `profile:${profile.id}`,
      user: {
        id: String(profile.id ?? ''),
        username: String(profile.username ?? ''),
        displayName: String(profile.display_name ?? ''),
        role: String(profile.role ?? 'staff') as AppRole,
        status: String(profile.status ?? 'active') as AccountStatus,
      },
    };
  },

  async getUsers() {
    const { data, error } = await supabase.from('profiles').select('id, username, display_name, role, status, created_at').order('created_at', { ascending: false });
    if (error) {
      throw new Error(toErrorMessage(error));
    }

    return (data ?? []).map(mapProfileRow);
  },

  async createUser(payload: CreateUserPayload) {
    const { data, error } = await supabase.from('profiles').insert({
      username: payload.username,
      pin_hash: payload.pin,
      display_name: payload.displayName,
      role: payload.role,
      status: payload.status ?? 'active',
    }).select('id').single();

    if (error) {
      throw new Error(toErrorMessage(error));
    }

    return data;
  },

  async resetPin(payload: ResetPinPayload) {
    const { error } = await supabase.rpc('set_profile_pin', {
      profile_id: payload.userId,
      new_pin: payload.pin,
    });

    if (error) {
      throw new Error(toErrorMessage(error));
    }
  },

  async updateRole(payload: UpdateUserRolePayload) {
    const { error } = await supabase.from('profiles').update({ role: payload.role }).eq('id', payload.userId);
    if (error) {
      throw new Error(toErrorMessage(error));
    }
  },

  async updateStatus(payload: UpdateUserStatusPayload) {
    const { error } = await supabase.rpc('set_profile_status', {
      profile_id: payload.userId,
      new_status: payload.status,
    });

    if (error) {
      throw new Error(toErrorMessage(error));
    }
  },
};
