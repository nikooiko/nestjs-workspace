import { TodoStatus } from '../enums/todo-status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class TodoDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ enum: TodoStatus })
  @IsEnum(TodoStatus)
  status: TodoStatus;
}
