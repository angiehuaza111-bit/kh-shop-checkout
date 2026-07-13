import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ConflictDomainError,
  DomainError,
  ExternalServiceDomainError,
  NotFoundDomainError,
  UnauthorizedDomainError,
  ValidationDomainError,
} from '../../domain/domain-error';

interface ErrorResponseBody {
  statusCode: number;
  code: string;
  message: string;
  timestamp: string;
  path: string;
}

const DOMAIN_ERROR_STATUS_MAP = [
  [NotFoundDomainError, HttpStatus.NOT_FOUND],
  [ValidationDomainError, HttpStatus.BAD_REQUEST],
  [ConflictDomainError, HttpStatus.CONFLICT],
  [UnauthorizedDomainError, HttpStatus.UNAUTHORIZED],
  [ExternalServiceDomainError, HttpStatus.BAD_GATEWAY],
] as const;

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, code, message } = this.resolve(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    }

    const body: ErrorResponseBody = {
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(body);
  }

  private resolve(exception: unknown): { status: number; code: string; message: string } {
    if (exception instanceof DomainError) {
      return this.resolveDomainError(exception);
    }

    if (exception instanceof HttpException) {
      return this.resolveHttpException(exception);
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    };
  }

  private resolveDomainError(exception: DomainError): {
    status: number;
    code: string;
    message: string;
  } {
    const match = DOMAIN_ERROR_STATUS_MAP.find(([ctor]) => exception instanceof ctor);
    const status = match ? match[1] : HttpStatus.BAD_REQUEST;

    return { status, code: exception.code, message: exception.message };
  }

  private resolveHttpException(exception: HttpException): {
    status: number;
    code: string;
    message: string;
  } {
    const status = exception.getStatus();
    const payload = exception.getResponse();
    const message =
      typeof payload === 'string'
        ? payload
        : ((payload as { message?: string | string[] }).message ?? exception.message);

    return {
      status,
      code: HttpStatus[status] ?? 'HTTP_EXCEPTION',
      message: Array.isArray(message) ? message.join(', ') : message,
    };
  }
}
