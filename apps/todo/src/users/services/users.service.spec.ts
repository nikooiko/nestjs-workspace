import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../../prisma/services/prisma.service';
import { LoggerModule } from '@app/core/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import usersConfig from '../config/users.config';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const prismaMock = mockDeep<PrismaService>();
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(usersConfig), LoggerModule],
      providers: [UsersService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
