import { createContext } from 'react';
import type { DrawerState } from '../types';

interface DrawerContextValue {
  drawer: DrawerState | null;
  openDrawer: (drawer: Omit<DrawerState, 'id'>) => void;
  closeDrawer: () => void;
}

export const DrawerContext = createContext<DrawerContextValue | undefined>(undefined);
