import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';
import {
  ConflictDomainError,
  DomainError,
  ExternalServiceDomainError,
  NotFoundDomainError,
  UnauthorizedDomainError,
  ValidationDomainError,
} from '../../domain/domain-error';

class UnmappedDomainError extends DomainError {
  readonly code = 'UNMAPPED';

  constructor() {
    super('unmapped domain error');
  }
}

function createMockHost(url = '/test'): {
  host: ArgumentsHost;
  json: jest.Mock;
  status: jest.Mock;
} {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url }),
    }),
  } as unknown as ArgumentsHost;

  return { host, json, status };
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('maps NotFoundDomainError to 404', () => {
    const { host, status, json } = createMockHost();

    filter.catch(new NotFoundDomainError('Product', 'abc-123'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'NOT_FOUND', statusCode: HttpStatus.NOT_FOUND }),
    );
  });

  it('maps ValidationDomainError to 400', () => {
    const { host, status } = createMockHost();

    filter.catch(new ValidationDomainError('bad input'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('maps ConflictDomainError to 409', () => {
    const { host, status } = createMockHost();

    filter.catch(new ConflictDomainError('insufficient stock'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('maps UnauthorizedDomainError to 401', () => {
    const { host, status } = createMockHost();

    filter.catch(new UnauthorizedDomainError(), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('maps ExternalServiceDomainError to 502', () => {
    const { host, status } = createMockHost();

    filter.catch(new ExternalServiceDomainError('gateway down'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
  });

  it('maps Nest HttpException using its own status and message', () => {
    const { host, status, json } = createMockHost();

    filter.catch(new BadRequestException('email must be an email'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'email must be an email' }),
    );
  });

  it('maps an array validation message by joining it', () => {
    const { host, json } = createMockHost();

    filter.catch(new BadRequestException(['field a is required', 'field b is required']), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'field a is required, field b is required' }),
    );
  });

  it('maps unknown errors to 500 without leaking internals', () => {
    const { host, status, json } = createMockHost();

    filter.catch(new Error('unexpected failure'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      }),
    );
  });

  it('falls back to 400 for a domain error not present in the status map', () => {
    const { host, status, json } = createMockHost();

    filter.catch(new UnmappedDomainError(), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'UNMAPPED' }));
  });

  it('falls back to the exception message when the response payload has no message field', () => {
    const { host, json } = createMockHost();

    filter.catch(new HttpException({ error: 'Forbidden resource' }, HttpStatus.FORBIDDEN), host);

    expect(json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  it('falls back to a generic code when the status is not in HttpStatus', () => {
    const { host, status, json } = createMockHost();

    filter.catch(new HttpException('custom failure', 599), host);

    expect(status).toHaveBeenCalledWith(599);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'HTTP_EXCEPTION' }));
  });

  it('includes the request path and an ISO timestamp', () => {
    const { host, json } = createMockHost('/products/123');

    filter.catch(new NotFoundDomainError('Product', '123'), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/products/123', timestamp: expect.any(String) }),
    );
  });
});
