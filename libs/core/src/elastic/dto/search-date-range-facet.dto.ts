import { ApiProperty } from '@nestjs/swagger';

export class SearchDateRangeFacet {
  @ApiProperty()
  key: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  from: Date;
}
