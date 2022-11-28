import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { PrismaExceptionsFilter } from './filters/prisma-exceptions.filter';
import { APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionsFilter,
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
