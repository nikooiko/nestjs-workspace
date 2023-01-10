import { applyDecorators } from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { AppUnauthorizedException } from '@app/core/api/exceptions/app-unauthorized.exception';

export function ApiAppUnauthorizedResponse(options?: ApiResponseOptions) {
  return applyDecorators(
    ApiUnauthorizedResponse({
      type: AppUnauthorizedException,
      description: AppUnauthorizedException.DESC_DEFAULT,
      ...options,
    }),
  );
}
