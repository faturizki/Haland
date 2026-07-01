export const createError = (code: string, message: string, details?: string[]) => ({
  code,
  message,
  details,
});

export const toErrorMessage = (error: unknown) => {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }

  return 'An unexpected error occurred.';
};
