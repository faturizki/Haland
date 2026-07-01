import { describe, expect, it } from 'vitest';
import { RepositoryError } from '../errors/domainError';
import { toRepositoryError } from './repositoryError';

describe('toRepositoryError', () => {
  it('returns existing repository errors unchanged', () => {
    const error = new RepositoryError('already wrapped');
    expect(toRepositoryError(error)).toBe(error);
  });

  it('wraps generic errors as repository errors', () => {
    const wrapped = toRepositoryError('boom');
    expect(wrapped).toBeInstanceOf(RepositoryError);
    expect(wrapped.message).toBe('boom');
  });
});
