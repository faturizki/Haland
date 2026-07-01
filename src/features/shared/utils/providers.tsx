import type { ReactNode } from 'react';
import { DialogProvider } from '../components/DialogProvider';
import { DrawerProvider } from '../components/DrawerProvider';
import { ToastProvider } from '../components/ToastProvider';

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <ToastProvider>
    <DialogProvider>
      <DrawerProvider>{children}</DrawerProvider>
    </DialogProvider>
  </ToastProvider>
);
