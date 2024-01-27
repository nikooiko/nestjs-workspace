import {
  BadRequestException,
  Injectable,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { APP_VALIDATION_ERROR } from '../constants/app-validation-error.constant';

@Injectable()
export class AppValidationPipe extends ValidationPipe {
  constructor() {
    super({
      enableDebugMessages: process.env.NODE_ENV !== 'production',
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: AppValidationPipe.exceptionFactory,
    });
  }

  /**
   * Converts provided class validation errors to BadRequestExceptions that contain the occurred
   * constraints in a format that is easy to parse by the callee.
   * @static
   * @param {ValidationError[]} [validationErrors=[]]
   * @returns {BadRequestException}
   */
  static exceptionFactory(validationErrors: ValidationError[] = []) {
    return new BadRequestException(
      validationErrors.map((error) => {
        return {
          property: error.property,
          value: error.value,
          constraints: error.constraints,
        };
      }),
      APP_VALIDATION_ERROR,
    );
  }
}
