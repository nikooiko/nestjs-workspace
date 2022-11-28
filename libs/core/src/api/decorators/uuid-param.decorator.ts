import { Param, ParseUUIDPipe } from '@nestjs/common';
import { AppBadRequestException } from '@app/core/api/exceptions/app-bad-request.exception';

export function UUIDParam(paramName = 'id'): ParameterDecorator {
  return Param(
    'id',
    new ParseUUIDPipe({
      exceptionFactory: () =>
        new AppBadRequestException(`Invalid '${paramName}' param`),
    }),
  );
}
