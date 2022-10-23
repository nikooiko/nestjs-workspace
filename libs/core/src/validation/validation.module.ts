import { HttpStatus, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { errorsToHttp } from './converters/errors.converter';

@Module({
  providers: [
    {
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
    },
  ],
})
export class ValidationModule {}
