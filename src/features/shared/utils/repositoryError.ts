import { RepositoryError } from '../errors/domainError';

export const toRepositoryError = (error: unknown, fallbackMessage = 'Terjadi kesalahan saat mengakses data.') => {
  if (error instanceof RepositoryError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error ?? '');
  return new RepositoryError(message || fallbackMessage);
};
