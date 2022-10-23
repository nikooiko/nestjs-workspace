import { Body, Controller, HttpCode, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiAppBadRequestResponse } from '@app/core/api/decorators/api-app-bad-request-response.decorator';
import { TodoDto } from '../dto/todo.dto';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';

@ApiTags('Todo')
@Controller('todo')
export class TodoController {
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
  async createTodo(@Body() data: CreateTodoDto): Promise<string> {
    return `created todo: ${data.title}`;
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
  @ApiAppBadRequestResponse()
  async updateTodo(
    @Param('id') id: string,
    @Body() data: UpdateTodoDto,
  ): Promise<string> {
    return `updated todo ${id} with ${data.title}`;
  }
}
