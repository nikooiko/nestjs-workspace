import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse } from '@nestjs/swagger';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { AppNotFoundException } from '@app/core/api/exceptions/app-not-found.exception';

export function ApiAppNotFoundResponse(options?: ApiResponseOptions) {
  return applyDecorators(
    ApiNotFoundResponse({
      type: AppNotFoundException,
      description: 'Not Found.',
      ...options,
    }),
  );
}
