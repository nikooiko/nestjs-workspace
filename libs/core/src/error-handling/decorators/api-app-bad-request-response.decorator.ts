import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiResponseOptions } from '@nestjs/swagger';
import { AppBadRequestException } from '../exceptions/app-bad-request.exception';

export function ApiAppBadRequestResponse(options?: ApiResponseOptions) {
  return applyDecorators(
    ApiBadRequestResponse({
      type: AppBadRequestException,
      description: AppBadRequestException.DESC_DEFAULT,
      ...options,
    }),
  );
}
