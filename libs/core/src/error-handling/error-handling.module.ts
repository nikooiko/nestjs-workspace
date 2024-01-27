import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppExceptionsFilter } from './filters/app-exceptions.filter';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: AppExceptionsFilter,
    },
  ],
})
export class ErrorHandlingModule {}
