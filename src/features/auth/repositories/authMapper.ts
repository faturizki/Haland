import type { UserListItem } from '../types';
import type { AppRole, AccountStatus } from '../../shared/types';

export const mapProfileRow = (row: Record<string, unknown>): UserListItem => ({
  id: String(row.id ?? ''),
  username: String(row.username ?? ''),
  displayName: String(row.display_name ?? ''),
  role: String(row.role ?? 'staff') as AppRole,
  status: String(row.status ?? 'active') as AccountStatus,
  createdAt: String(row.created_at ?? ''),
});
