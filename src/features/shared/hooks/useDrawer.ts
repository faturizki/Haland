import { useContext } from 'react';
import { DrawerContext } from '../utils/drawer-context';

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used inside DrawerProvider');
  }
  return context;
};
