import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppValidationPipe } from '@app/core/validation/pipes/app-validation.pipe';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: AppValidationPipe,
    },
  ],
})
export class ValidationModule {}
