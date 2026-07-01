import type { ReactNode } from 'react';
import { ToastProvider as ToastProviderImpl } from '../../shared/utils/toast';

export const ToastProvider = ({ children }: { children: ReactNode }) => <ToastProviderImpl>{children}</ToastProviderImpl>;
