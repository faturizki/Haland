import { useMemo, useState, type ReactNode } from 'react';
import type { DialogState } from '../types';
import { DialogContext } from './dialog-context';

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const openDialog = (value: Omit<DialogState, 'id'>) => {
    setDialog({ id: `${Date.now()}`, ...value });
  };

  const closeDialog = () => {
    setDialog(null);
  };

  const value = useMemo(() => ({ dialog, openDialog, closeDialog }), [dialog]);

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
};

