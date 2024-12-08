import { ForbiddenException, HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppForbiddenException extends ForbiddenException {
  static DESC_DEFAULT = 'Forbidden';
  static ERROR_DEFAULT = 'forbidden';

  constructor(
    description: any = AppForbiddenException.DESC_DEFAULT,
    error: string = AppForbiddenException.ERROR_DEFAULT,
  ) {
    super(description, error);
  }

  @ApiProperty({ example: HttpStatus.UNAUTHORIZED })
  statusCode: number;

  @ApiProperty({ example: AppForbiddenException.DESC_DEFAULT })
  message: string;

  @ApiPropertyOptional({ example: AppForbiddenException.ERROR_DEFAULT })
  error?: string;
}
