import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { LOGGER } from '@app/core/logger/factories/logger.factory';
import { Prisma, Todo } from '@app/todo/prisma-client';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';
import { PrismaService } from '../../prisma/services/prisma.service';

@Injectable()
export class TodoService {
  constructor(
    @Inject(LOGGER) private readonly logger: Logger,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(args?: Prisma.TodoFindManyArgs): Promise<{
    items: Todo[];
    count: number;
  }> {
    const [items, count] = await this.prisma.$transaction([
      this.prisma.todo.findMany(args),
      this.prisma.todo.count({ where: args?.where }),
    ]);
    return {
      items,
      count,
    };
  }

  async create(data: CreateTodoDto & { ownerId: string }): Promise<Todo> {
    const todo = await this.prisma.todo.create({
      data,
    });
    this.logger.info('Created Todo', {
      type: 'TODO_CREATED',
      id: todo.id,
      data,
    });
    return todo;
  }

  async update(
    where: Prisma.TodoWhereUniqueInput,
    data: UpdateTodoDto,
  ): Promise<Todo> {
    const todo = await this.prisma.todo.update({
      where,
      data,
    });
    this.logger.info('Updated Todo', { type: 'TODO_UPDATED', where, data });
    return todo;
  }

  async delete(where: Prisma.TodoWhereUniqueInput) {
    await this.prisma.todo.delete({ where });
    this.logger.info('Deleted Todo', { type: 'TODO_DELETED', where });
  }
}
