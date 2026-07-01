import type { ReactNode } from 'react';

interface RouteLayoutProps {
  children: ReactNode;
}

export const RouteLayout = ({ children }: RouteLayoutProps) => {
  return <div className="route-layout">{children}</div>;
};
