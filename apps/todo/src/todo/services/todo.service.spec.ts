import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { LoggerModule } from '@app/core/logger/logger.module';
import { PrismaClient } from '@app/todo/prisma-client';
import { TodoService } from './todo.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/services/prisma.service';

describe('TodoService', () => {
  let service: TodoService;
  const mockPrisma: any = mockDeep<PrismaClient>();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TodoService],
      imports: [LoggerModule, PrismaModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    service = module.get<TodoService>(TodoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
