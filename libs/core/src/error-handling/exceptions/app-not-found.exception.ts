import { HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppNotFoundException extends NotFoundException {
  static DESC_DEFAULT = 'Not Found';
  static ERROR_DEFAULT = 'not_found';

  constructor(
    description: any = AppNotFoundException.DESC_DEFAULT,
    error: string = AppNotFoundException.ERROR_DEFAULT,
  ) {
    super(description, error);
  }

  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  statusCode: number;

  @ApiProperty({ example: AppNotFoundException.DESC_DEFAULT })
  message: string;

  @ApiPropertyOptional({ example: AppNotFoundException.ERROR_DEFAULT })
  error?: string;
}
