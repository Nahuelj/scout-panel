import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

type ResponseBody = {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = isHttp
      ? exception.message
      : 'Internal server error';
    let error = isHttp ? exception.name : 'InternalServerError';

    if (isHttp) {
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const obj = res as { message?: string | string[]; error?: string };
        if (obj.message !== undefined) message = obj.message;
        if (obj.error !== undefined) error = obj.error;
      } else if (typeof res === 'string') {
        message = res;
      }
    }

    if (!isHttp) {
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.originalUrl}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ResponseBody = {
      statusCode: status,
      error,
      message,
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    };

    if (response.headersSent) return;
    response.status(status).json(body);
  }
}
