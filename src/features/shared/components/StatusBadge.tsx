import type { ReactNode } from 'react';

interface StatusBadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}

export const StatusBadge = ({ children, tone = 'neutral' }: StatusBadgeProps) => {
  return <span className={`status-badge status-badge--${tone}`}>{children}</span>;
};
