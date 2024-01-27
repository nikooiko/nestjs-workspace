import { ArgumentsHost, Catch, HttpException, Inject } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Logger } from 'winston';
import { LOGGER } from '../../logger/factories/logger.factory';
import { AppInternalServerErrorException } from '../exceptions/app-internal-server-error.exception';

/**
 * This filter is used to catch all exceptions that are not handled by the other attached filters. Handles exception in
 * the same manner as the core NestJS base exception filter, but also logs any uncaught exceptions to Sentry. Any
 * exception that is not HttpException is treated as uncaught exception, (this is based on the standard NestJS error
 * handling flow, where all exceptions thrown by the application that are not HttpExceptions are treated as Server
 * Errors 500).
 */
@Catch()
export class AppExceptionsFilter extends BaseExceptionFilter {
  constructor(@Inject(LOGGER) private readonly logger: Logger) {
    super();
  }

  catch(exception: any, host: ArgumentsHost) {
    super.catch(this.exceptionToHttp(exception), host);
  }

  exceptionToHttp(err: any): HttpException {
    if (err instanceof HttpException) {
      return err;
    }
    this.logger.error('Uncaught exception occurred', {
      err,
      type: 'UNCAUGHT_EXCEPTION',
    });
    return new AppInternalServerErrorException();
  }
}
