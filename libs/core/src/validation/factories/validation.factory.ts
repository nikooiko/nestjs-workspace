import { APP_PIPE } from '@nestjs/core';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { errorsToHttp } from '@app/core/validation/converters/errors.converter';

export const validationFactory = {
  provide: APP_PIPE,
  useFactory: () =>
    new ValidationPipe({
      enableDebugMessages: process.env.NODE_ENV !== 'production',
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      exceptionFactory: errorsToHttp,
    }),
};
