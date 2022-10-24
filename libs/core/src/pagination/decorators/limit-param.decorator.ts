import { applyDecorators } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export function LimitParam(params: { default?: number; max?: number } = {}) {
  const min = 1;
  const max = params.max ?? 100;
  return applyDecorators(
    ApiPropertyOptional({
      minimum: min,
      maximum: max,
      default: params.default,
    }),
    IsInt(),
    Min(min),
    Max(max),
    IsOptional(),
  );
}
