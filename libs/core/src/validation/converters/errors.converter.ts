import { ValidationError } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export function errorsToHttp(validationErrors: ValidationError[] = []) {
  return new BadRequestException(
    validationErrors.map((error) => {
      return {
        property: error.property,
        value: error.value,
        constraints: error.constraints,
      };
    }),
    'input_validation',
  );
}
