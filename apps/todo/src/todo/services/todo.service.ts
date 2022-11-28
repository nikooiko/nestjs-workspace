import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { LOGGER } from '@app/core/logger/factories/logger.factory';
import { Todo } from '@app/todo/prisma-client';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';
import { FindAllParams } from '../interfaces/find-todos-param.interface';
import { PrismaService } from '../../prisma/services/prisma.service';

@Injectable()
export class TodoService {
  constructor(
    @Inject(LOGGER) private readonly logger: Logger,
    private readonly prisma: PrismaService,
  ) {}

  async findAll({ page, limit }: FindAllParams): Promise<{
    items: Todo[];
    count: number;
  }> {
    const [count, items] = await this.prisma.$transaction([
      this.prisma.todo.count(),
      this.prisma.todo.findMany({
        take: limit,
        skip: page * limit,
      }),
    ]);
    return {
      items,
      count,
    };
  }

  async create(data: CreateTodoDto): Promise<Todo> {
    const todo = await this.prisma.todo.create({ data });
    this.logger.info('Created Todo', { type: 'TODO_CREATED', id: todo.id });
    return todo;
  }

  async update(id: string, data: UpdateTodoDto): Promise<Todo> {
    const todo = await this.prisma.todo.update({ where: { id }, data });
    this.logger.info('Updated Todo', { type: 'TODO_UPDATED', id });
    return todo;
  }

  async delete(id: string) {
    await this.prisma.todo.delete({ where: { id } });
    this.logger.info('Deleted Todo', { type: 'TODO_DELETED', id });
  }
}
