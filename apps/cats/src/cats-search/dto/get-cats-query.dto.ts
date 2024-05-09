import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { LimitParam } from '@app/core/pagination/decorators/limit-param.decorator';
import { PageParam } from '@app/core/pagination/decorators/page-param.decorator';
import { SearchCatsOrderBy } from '../enums/search-cats-order-by.enum';
import { SearchCatsFacet } from '../enums/search-cats-facet.enum';
import { CommaSeparatedArrayParam } from '@app/core/api/decorators/comma-separated-array-param.decorator';

export class GetCatsQueryDto {
  @ApiPropertyOptional({ maxLength: 255 })
  @MaxLength(255)
  @IsString()
  @IsOptional()
  readonly q?: string;

  @CommaSeparatedArrayParam(Number)
  readonly age?: number[]; // 2 numbers, from - to

  @CommaSeparatedArrayParam(String)
  readonly gender?: string[];

  @CommaSeparatedArrayParam(String)
  readonly colors?: string[];

  @LimitParam({ default: 10, max: 10000 })
  readonly limit: number = 10;

  @PageParam()
  readonly page: number = 0;

  @ApiPropertyOptional({
    enum: SearchCatsOrderBy,
    enumName: 'SearchCatsOrderBy',
  })
  @IsOptional()
  @IsString()
  @IsEnum(SearchCatsOrderBy)
  readonly orderBy?: SearchCatsOrderBy;

  @CommaSeparatedArrayParam(String, SearchCatsFacet)
  readonly facets?: SearchCatsFacet[];
}
