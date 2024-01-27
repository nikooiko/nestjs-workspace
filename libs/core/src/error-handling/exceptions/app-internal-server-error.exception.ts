import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppInternalServerErrorException extends InternalServerErrorException {
  static DESC_DEFAULT = 'Internal server error';
  static ERROR_DEFAULT = 'internal_server_error';

  constructor(
    description: any = AppInternalServerErrorException.DESC_DEFAULT,
    error: string = AppInternalServerErrorException.ERROR_DEFAULT,
  ) {
    super(description, error);
  }

  @ApiProperty({ example: HttpStatus.INTERNAL_SERVER_ERROR })
  statusCode: number;

  @ApiProperty({ example: AppInternalServerErrorException.ERROR_DEFAULT })
  message: string;

  @ApiPropertyOptional({
    example: AppInternalServerErrorException.ERROR_DEFAULT,
  })
  error?: string;
}
