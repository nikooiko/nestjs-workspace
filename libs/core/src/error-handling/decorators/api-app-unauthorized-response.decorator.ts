import { applyDecorators } from '@nestjs/common';
import { ApiResponseOptions, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AppUnauthorizedException } from '../exceptions/app-unauthorized.exception';

export function ApiAppUnauthorizedResponse(options?: ApiResponseOptions) {
  return applyDecorators(
    ApiUnauthorizedResponse({
      type: AppUnauthorizedException,
      description: AppUnauthorizedException.DESC_DEFAULT,
      ...options,
    }),
  );
}
