import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiAppBadRequestResponse } from '@app/core/api/decorators/api-app-bad-request-response.decorator';
import { TodoDto } from '../dto/todo.dto';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';
import { TodoService } from '../services/todo.service';
import { FindAllTodosQueryDto } from '../dto/find-all-todos-query.dto';
import { TodosListDto } from '../dto/todos-list.dto';
import { UUIDParam } from '@app/core/api/decorators/uuid-param.decorator';
import { ApiAppNotFoundResponse } from '@app/core/api/decorators/api-app-not-found-response.decorator';

@ApiTags('Todo')
@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Returns the list of Todos',
  })
  @ApiOkResponse({ type: TodosListDto })
  async findAll(@Query() query: FindAllTodosQueryDto): Promise<TodosListDto> {
    const { limit, page } = query;
    const { items, count } = await this.todoService.findAll({ page, limit });
    return {
      limit,
      pages: Math.ceil(count / limit),
      items,
      count,
    };
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Creates a new Todo.',
  })
  @ApiBody({
    type: CreateTodoDto,
  })
  @ApiCreatedResponse({
    type: TodoDto,
  })
  @ApiAppBadRequestResponse()
  async create(@Body() data: CreateTodoDto): Promise<TodoDto> {
    return this.todoService.create(data);
  }

  @Patch(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Updates the Todo.',
  })
  @ApiBody({
    type: UpdateTodoDto,
  })
  @ApiOkResponse({
    type: TodoDto,
  })
  @ApiAppNotFoundResponse()
  @ApiAppBadRequestResponse()
  async update(
    @UUIDParam() id: string,
    @Body() data: UpdateTodoDto,
  ): Promise<TodoDto> {
    return this.todoService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Deletes the Todo.',
  })
  @ApiNoContentResponse()
  @ApiAppNotFoundResponse()
  @ApiAppBadRequestResponse()
  async delete(@UUIDParam() id: string): Promise<void> {
    return this.todoService.delete(id);
  }
}
