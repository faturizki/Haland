import { useContext } from 'react';
import { DialogContext } from '../utils/dialog-context';

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used inside DialogProvider');
  }
  return context;
};
