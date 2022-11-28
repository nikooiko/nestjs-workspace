import { ApiProperty } from '@nestjs/swagger';
import { PagedListDto } from '@app/core/pagination/dto/paged-list.dto';
import { TodoDto } from './todo.dto';

export class TodosListDto extends PagedListDto {
  @ApiProperty({ type: [TodoDto] })
  items: TodoDto[];
}
