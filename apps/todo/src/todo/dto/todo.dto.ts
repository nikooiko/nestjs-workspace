import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID } from 'class-validator';
import { Todo, TodoStatus } from '@app/todo/prisma-client';

export class TodoDto implements Todo {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ enum: TodoStatus })
  @IsEnum(TodoStatus)
  status: TodoStatus;
}
