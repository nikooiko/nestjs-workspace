import { BadRequestException, HttpStatus } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { AppValidationError } from '../../validation/types/AppValidationError';
import { APP_VALIDATION_ERROR } from '../../validation/constants/app-validation-error.constant';

@ApiExtraModels(AppValidationError)
export class AppBadRequestException extends BadRequestException {
  static DESC_DEFAULT = 'Bad Request';
  static ERROR_DEFAULT = 'bad_request';

  constructor(
    description: any = AppBadRequestException.DESC_DEFAULT,
    error: string = AppBadRequestException.ERROR_DEFAULT,
  ) {
    super(description, error);
  }

  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  statusCode: number;

  @ApiProperty({
    oneOf: [
      {
        // first element is also the example
        type: 'array',
        items: { $ref: getSchemaPath(AppValidationError) },
      },
      {
        type: 'string',
      },
    ],
  })
  message: any;

  @ApiPropertyOptional({ example: APP_VALIDATION_ERROR }) // as we give AppValidationError as example, we also give the corresponding error as example
  error?: string;
}
