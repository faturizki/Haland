import type { ReactNode } from 'react';
import { RoleNavigation } from '../components/RoleNavigation';
import type { NavigationItem } from '../types';

interface AppLayoutProps {
  children: ReactNode;
  role: string;
  title: string;
  navigationItems: NavigationItem[];
}

export const AppLayout = ({ children, role, title, navigationItems }: AppLayoutProps) => {
  return (
    <div className="app-layout">
      <aside className="app-layout__sidebar">
        <div>
          <h2>{title}</h2>
          <p>Production foundation</p>
        </div>
        <RoleNavigation items={navigationItems} currentRole={role} />
      </aside>
      <main className="app-layout__main">{children}</main>
    </div>
  );
};
