import { useMemo, useState, type ReactNode } from 'react';
import type { DrawerState } from '../types';
import { DrawerContext } from './drawer-context';

export const DrawerProvider = ({ children }: { children: ReactNode }) => {
  const [drawer, setDrawer] = useState<DrawerState | null>(null);

  const openDrawer = (value: Omit<DrawerState, 'id'>) => {
    setDrawer({ id: `${Date.now()}`, ...value });
  };

  const closeDrawer = () => {
    setDrawer(null);
  };

  const value = useMemo(() => ({ drawer, openDrawer, closeDrawer }), [drawer]);

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
};

