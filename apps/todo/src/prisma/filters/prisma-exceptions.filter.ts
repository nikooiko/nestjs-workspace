import { ArgumentsHost, Catch, HttpException, Inject } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Logger } from 'winston';
import { Prisma } from '@app/todo/prisma-client';
import { LOGGER } from '@app/core/logger/factories/logger.factory';
import { AppInternalServerErrorException } from '@app/core/error-handling/exceptions/app-internal-server-error.exception';
import { AppNotFoundException } from '@app/core/error-handling/exceptions/app-not-found.exception';
import { AppBadRequestException } from '@app/core/error-handling/exceptions/app-bad-request.exception';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.NotFoundError)
export class PrismaExceptionsFilter extends BaseExceptionFilter {
  constructor(@Inject(LOGGER) private readonly logger: Logger) {
    super();
  }

  catch(
    exception: Prisma.PrismaClientKnownRequestError | Prisma.NotFoundError,
    host: ArgumentsHost,
  ) {
    super.catch(this.exceptionToHttp(exception), host);
  }

  /**
   * Converts provided prisma exception to HttpException.
   * (based on https://www.prisma.io/docs/reference/api-reference/error-reference)
   * @param exception
   * @returns {HttpException}
   */
  exceptionToHttp(
    exception: Prisma.PrismaClientKnownRequestError | Prisma.NotFoundError,
  ): HttpException {
    if (exception instanceof Prisma.NotFoundError) {
      return new AppNotFoundException();
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          return new AppBadRequestException(
            'Unique Constraint Violation',
            'unique_constraint',
          );
        case 'P2025':
          return new AppNotFoundException();
      }
    }
    this.logger.error('Unexpected prisma error', {
      type: 'UNEXPECTED_PRISMA_ERROR',
      error: exception,
      code: exception.code,
      meta: exception.meta,
      clientVersion: exception.clientVersion,
    });
    return new AppInternalServerErrorException();
  }
}
