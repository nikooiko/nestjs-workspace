import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppBadRequestException extends BadRequestException {
  static DESC_DEFAULT = 'Bad Request';
  static ERROR_DEFAULT = 'bad_request';

  constructor(
    description: any = AppBadRequestException.DESC_DEFAULT,
    error: string = AppBadRequestException.ERROR_DEFAULT,
  ) {
    super(description, error);
  }

  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  statusCode: number;

  @ApiProperty({ example: AppBadRequestException.DESC_DEFAULT })
  message: string;

  @ApiPropertyOptional({ example: AppBadRequestException.ERROR_DEFAULT })
  error?: string;
}
