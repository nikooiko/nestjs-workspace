import { applyDecorators } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export function CommaSeparatedArrayParam(TargetType: any = String, Enum?: any) {
  let IsType;
  let transformer: (value: string) => number | string;
  switch (TargetType) {
    case Number:
      IsType = IsInt;
      transformer = (value) => parseInt(value, 10);
      break;
    default:
      IsType = IsString;
      transformer = (value) => value;
  }
  return applyDecorators(
    ApiPropertyOptional({
      enum: Enum,
      type: [TargetType],
    }),
    Enum ? IsEnum(Enum, { each: true }) : () => true, // true could be any returning value
    IsType({ each: true }),
    Transform(({ value }) => {
      const arrayValue = typeof value === 'string' ? value.split(',') : value;
      return Array.isArray(arrayValue)
        ? arrayValue.map((value) => transformer(value))
        : arrayValue;
    }),
    IsOptional(),
  );
}
