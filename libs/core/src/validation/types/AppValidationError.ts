import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppValidationError {
  @ApiProperty()
  property: string;
  @ApiPropertyOptional({
    oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'object' }],
  })
  value?: object | string | number;
  @ApiProperty({ additionalProperties: { type: 'string' } })
  constrains: any;
  @ApiPropertyOptional({
    description: 'AppValidationError',
    type: () => [AppValidationError],
    example: ['AppValidationError'],
  })
  children: AppValidationError[];
}
