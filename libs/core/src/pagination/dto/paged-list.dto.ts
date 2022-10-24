import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Min } from 'class-validator';

export class PagedListDto {
  items: unknown; // must override this
  @ApiProperty({ minimum: 1 })
  @IsNumber()
  @IsPositive()
  limit: number;
  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  @ApiProperty()
  count: number;
  @ApiProperty({ minimum: 1 })
  @IsNumber()
  @IsPositive()
  pages: number;
}
