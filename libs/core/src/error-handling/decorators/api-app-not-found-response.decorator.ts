import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiResponseOptions } from '@nestjs/swagger';
import { AppNotFoundException } from '../exceptions/app-not-found.exception';

export function ApiAppNotFoundResponse(options?: ApiResponseOptions) {
  return applyDecorators(
    ApiNotFoundResponse({
      type: AppNotFoundException,
      description: AppNotFoundException.DESC_DEFAULT,
      ...options,
    }),
  );
}
