export class DomainError extends Error {
  constructor(message: string, public readonly code: string = 'domain_error') {
    super(message);
    this.name = 'DomainError';
  }
}

export class RepositoryError extends DomainError {
  constructor(message: string, code: string = 'repository_error') {
    super(message, code);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 'validation_error');
  }
}
