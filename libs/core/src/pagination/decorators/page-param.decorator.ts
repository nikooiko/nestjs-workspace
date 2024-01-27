import { applyDecorators } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { MaxPage } from './max-page-validator.decorator';

export function PageParam(params: { default?: number; max?: number } = {}) {
  const extraDecorators = [];
  const defaultValue = params.default ?? 0;
  const min = 0;
  if (params.max !== undefined && Number.isFinite(params.max)) {
    extraDecorators.push(
      MaxPage(params.max, {
        message:
          'Page is too large. Maximum value is limit*page == $constraint1',
      }),
    );
  }
  return applyDecorators(
    ApiPropertyOptional({
      minimum: min,
      default: defaultValue,
    }),
    IsInt(),
    Min(min),
    ...extraDecorators,
  );
}
