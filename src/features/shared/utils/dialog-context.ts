import { createContext } from 'react';
import type { DialogState } from '../types';

interface DialogContextValue {
  dialog: DialogState | null;
  openDialog: (dialog: Omit<DialogState, 'id'>) => void;
  closeDialog: () => void;
}

export const DialogContext = createContext<DialogContextValue | undefined>(undefined);
