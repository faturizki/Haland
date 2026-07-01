import type { ReactNode } from 'react';
import { DrawerProvider as DrawerProviderImpl } from '../../shared/utils/drawer';

export const DrawerProvider = ({ children }: { children: ReactNode }) => <DrawerProviderImpl>{children}</DrawerProviderImpl>;
