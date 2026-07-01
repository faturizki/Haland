import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppShell } from '../../shared/components/AppShell';
import { DataTable } from '../../shared/components/DataTable';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { emptyStateMessage } from '../../shared/utils/empty';
import { useToast } from '../../shared/hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { createUserSchema, resetPinSchema, updateRoleSchema } from '../validation';
import { createAuthUseCases } from '../application/authUseCases';
import { supabaseAuthRepository } from '../repositories/supabaseAuthRepository';
import { canActivateOrDeactivate, canChangeRole, canCreateRole, canCreateUsers, canResetPin } from '../services/permissionService';
import type { CreateUserPayload, ResetPinPayload, UpdateUserRolePayload } from '../types';

export const UserManagementScreen = () => {
  const { user, users, loadUsers } = useAuth();
  const { addToast } = useToast();
  const authUseCases = useMemo(() => createAuthUseCases(supabaseAuthRepository), []);
  const [filter, setFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createForm = useForm<CreateUserPayload>({ resolver: zodResolver(createUserSchema), defaultValues: { role: 'customer', status: 'active' } });
  const resetPinForm = useForm<ResetPinPayload>({ resolver: zodResolver(resetPinSchema), defaultValues: { pin: '123456' } });
  const roleForm = useForm<UpdateUserRolePayload>({ resolver: zodResolver(updateRoleSchema), defaultValues: { role: 'customer' } });

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const visibleUsers = useMemo(() => {
    const query = filter.toLowerCase();
    return users.filter((entry) => [entry.username, entry.displayName, entry.role].join(' ').toLowerCase().includes(query));
  }, [filter, users]);

  const onCreateUser = async (values: CreateUserPayload) => {
    if (!user || !canCreateUsers(user.role)) {
      setError('You are not permitted to create users.');
      return;
    }

    if (!canCreateRole(user.role, values.role)) {
      setError('This role cannot be assigned by your account.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await authUseCases.createUser(values);
      addToast({ title: 'User created', description: 'The account was created successfully.', variant: 'success' });
      await loadUsers();
      createForm.reset();
    } catch (serviceError) {
      const message = serviceError instanceof Error ? serviceError.message : 'Unable to create user.';
      setError(message);
      addToast({ title: 'User creation failed', description: message, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetPin = async (values: ResetPinPayload) => {
    if (!user || !canResetPin(user.role)) {
      setError('You are not permitted to reset PINS.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await authUseCases.resetPin(values);
      addToast({ title: 'PIN reset', description: 'The PIN was updated successfully.', variant: 'success' });
    } catch (serviceError) {
      const message = serviceError instanceof Error ? serviceError.message : 'Unable to reset PIN.';
      setError(message);
      addToast({ title: 'PIN reset failed', description: message, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onChangeRole = async (values: UpdateUserRolePayload) => {
    if (!user || !canChangeRole(user.role)) {
      setError('Only owners can change roles.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await authUseCases.updateRole(values);
      addToast({ title: 'Role updated', description: 'The role was changed successfully.', variant: 'success' });
      await loadUsers();
    } catch (serviceError) {
      const message = serviceError instanceof Error ? serviceError.message : 'Unable to change role.';
      setError(message);
      addToast({ title: 'Role update failed', description: message, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onToggleStatus = async (userId: string, status: 'active' | 'inactive') => {
    if (!user || !canActivateOrDeactivate(user.role)) {
      setError('Only owners can activate or deactivate accounts.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await authUseCases.updateStatus({ userId, status });
      addToast({ title: 'Account updated', description: 'The account status was changed successfully.', variant: 'success' });
      await loadUsers();
    } catch (serviceError) {
      const message = serviceError instanceof Error ? serviceError.message : 'Unable to update account status.';
      setError(message);
      addToast({ title: 'Status update failed', description: message, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell title="User management" description="Create and manage clinic users with role-based access controls.">
      <section className="surface-card">
        <h2>Create account</h2>
        <form onSubmit={createForm.handleSubmit(onCreateUser)} className="form-builder">
          <label className="form-builder__field">
            <span>Username</span>
            <input {...createForm.register('username')} />
          </label>
          <label className="form-builder__field">
            <span>Display name</span>
            <input {...createForm.register('displayName')} />
          </label>
          <label className="form-builder__field">
            <span>6-digit PIN</span>
            <input type="password" {...createForm.register('pin')} />
          </label>
          <label className="form-builder__field">
            <span>Role</span>
            <select {...createForm.register('role')}>
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="doctor">Doctor</option>
              <option value="owner">Owner</option>
            </select>
          </label>
          <label className="form-builder__field">
            <span>Status</span>
            <select {...createForm.register('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          {createForm.formState.errors.username ? <p className="form-error">{createForm.formState.errors.username.message}</p> : null}
          {createForm.formState.errors.pin ? <p className="form-error">{createForm.formState.errors.pin.message}</p> : null}
          <button type="submit" disabled={isSubmitting}>Create account</button>
        </form>
      </section>

      <section className="surface-card">
        <h2>Users</h2>
        <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Search users" />
        {error ? <p className="form-error">{error}</p> : null}
        <DataTable
          columns={[
            { key: 'username', header: 'Username', render: (row) => row.username },
            { key: 'displayName', header: 'Name', render: (row) => row.displayName },
            { key: 'role', header: 'Role', render: (row) => <StatusBadge tone="neutral">{row.role}</StatusBadge> },
            { key: 'status', header: 'Status', render: (row) => <StatusBadge tone={row.status === 'active' ? 'success' : 'warning'}>{row.status}</StatusBadge> },
            {
              key: 'actions',
              header: 'Actions',
              render: (row) => (
                <div>
                  <button type="button" onClick={() => void onToggleStatus(row.id, row.status === 'active' ? 'inactive' : 'active')}>
                    {row.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button type="button" onClick={() => void onResetPin({ userId: row.id, pin: '123456' })}>Reset PIN</button>
                </div>
              ),
            },
          ]}
          rows={visibleUsers}
          emptyMessage={emptyStateMessage('users')}
        />
      </section>

      <section className="surface-card">
        <h2>Role management</h2>
        <form onSubmit={roleForm.handleSubmit(onChangeRole)} className="form-builder">
          <label className="form-builder__field">
            <span>User ID</span>
            <input {...roleForm.register('userId')} />
          </label>
          <label className="form-builder__field">
            <span>Role</span>
            <select {...roleForm.register('role')}>
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="doctor">Doctor</option>
              <option value="owner">Owner</option>
            </select>
          </label>
          <button type="submit" disabled={isSubmitting}>Change role</button>
        </form>
      </section>

      <section className="surface-card">
        <h2>Reset PIN</h2>
        <form onSubmit={resetPinForm.handleSubmit(onResetPin)} className="form-builder">
          <label className="form-builder__field">
            <span>User ID</span>
            <input {...resetPinForm.register('userId')} />
          </label>
          <label className="form-builder__field">
            <span>6-digit PIN</span>
            <input type="password" {...resetPinForm.register('pin')} />
          </label>
          <button type="submit" disabled={isSubmitting}>Reset PIN</button>
        </form>
      </section>
    </AppShell>
  );
};
