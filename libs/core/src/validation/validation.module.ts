import { Module } from '@nestjs/common';
import { validationFactory } from '@app/core/validation/factories/validation.factory';

@Module({
  providers: [validationFactory],
})
export class ValidationModule {}
