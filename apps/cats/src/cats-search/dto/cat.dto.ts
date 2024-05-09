import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SearchCat } from '../interfaces/search-cat.interface';

export class Cat {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  colors: string[];

  @ApiPropertyOptional()
  score?: number; // will be provided only when retrieved from search index

  static toSearch(data: Cat): SearchCat {
    return {
      created_at: data.createdAt,
      name: data.name,
      age: data.age,
      gender: data.gender,
      colors: data.colors,
    };
  }

  static fromSearch(id: string, data: SearchCat): Cat {
    return {
      id,
      createdAt: data.created_at,
      name: data.name,
      age: data.age,
      gender: data.gender,
      colors: data.colors,
      score: data.score,
    };
  }
}
