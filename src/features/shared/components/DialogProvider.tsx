import type { ReactNode } from 'react';
import { DialogProvider as DialogProviderImpl } from '../../shared/utils/dialog';

export const DialogProvider = ({ children }: { children: ReactNode }) => <DialogProviderImpl>{children}</DialogProviderImpl>;
