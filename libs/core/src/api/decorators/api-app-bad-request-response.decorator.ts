import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse } from '@nestjs/swagger';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { AppBadRequestException } from '@app/core/api/exceptions/app-bad-request.exception';

export function ApiAppBadRequestResponse(options?: ApiResponseOptions) {
  return applyDecorators(
    ApiBadRequestResponse({
      type: AppBadRequestException,
      description: 'Bad request.',
      ...options,
    }),
  );
}
