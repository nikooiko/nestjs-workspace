import { OmitType } from '@nestjs/swagger';
import { TodoDto } from './todo.dto';

export class CreateTodoDto extends OmitType(TodoDto, ['id'] as const) {}
