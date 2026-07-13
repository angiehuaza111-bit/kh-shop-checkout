export abstract class DomainError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundDomainError extends DomainError {
  readonly code = 'NOT_FOUND';

  constructor(resource: string, identifier: string) {
    super(`${resource} with identifier "${identifier}" was not found`);
  }
}

export class ValidationDomainError extends DomainError {
  readonly code = 'VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
  }
}

export class ConflictDomainError extends DomainError {
  readonly code = 'CONFLICT';

  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedDomainError extends DomainError {
  readonly code = 'UNAUTHORIZED';

  constructor(message = 'Invalid credentials') {
    super(message);
  }
}

export class ExternalServiceDomainError extends DomainError {
  readonly code = 'EXTERNAL_SERVICE_ERROR';

  constructor(message: string) {
    super(message);
  }
}
