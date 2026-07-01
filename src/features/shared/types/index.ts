import type { ReactNode } from 'react';

export type AppRole = 'owner' | 'doctor' | 'staff' | 'customer';

export type AccountStatus = 'active' | 'inactive';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  status: AccountStatus;
}

export interface AppSession {
  user: AppUser;
  role: AppRole;
  expiresAt: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  roles: AppRole[];
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

export interface DialogState {
  id: string;
  title: string;
  description?: string;
  content?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export interface DrawerState {
  id: string;
  title: string;
  description?: string;
  content?: ReactNode;
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface FormFieldDefinition {
  name: string;
  label: string;
  type?: 'text' | 'password' | 'email' | 'number';
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  description?: string;
}

export interface AppErrorShape {
  code: string;
  message: string;
  details?: string[];
}

export interface FeatureRouteDefinition {
  path: string;
  label: string;
  roles: AppRole[];
  component: React.ComponentType;
}
