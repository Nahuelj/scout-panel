import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HttpExceptionFilter } from './http-exception.filter';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly httpFilter = new HttpExceptionFilter();

  catch(exception: unknown, host: ArgumentsHost) {
    this.httpFilter.catch(this.toHttpException(exception), host);
  }

  private toHttpException(exception: unknown): HttpException {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2025':
          return new NotFoundException('Resource not found');
        case 'P2002':
          return new ConflictException('Unique constraint violation');
        case 'P2003':
          return new ConflictException('Related resource does not exist');
        case 'P2000':
          return new BadRequestException('Provided value is too long');
      }
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return new BadRequestException('Invalid database query');
    }

    return new InternalServerErrorException();
  }
}
