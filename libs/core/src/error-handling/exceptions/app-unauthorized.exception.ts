import { HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppUnauthorizedException extends UnauthorizedException {
  static DESC_DEFAULT = 'Unauthorized';
  static ERROR_DEFAULT = 'unauthorized';

  constructor(
    description: any = AppUnauthorizedException.DESC_DEFAULT,
    error: string = AppUnauthorizedException.ERROR_DEFAULT,
  ) {
    super(description, error);
  }

  @ApiProperty({ example: HttpStatus.UNAUTHORIZED })
  statusCode: number;

  @ApiProperty({ example: AppUnauthorizedException.DESC_DEFAULT })
  message: string;

  @ApiPropertyOptional({ example: AppUnauthorizedException.ERROR_DEFAULT })
  error?: string;
}
