import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './services/users.service';
import { PrismaModule } from '../prisma/prisma.module';
import usersConfig from './config/users.config';

@Module({
  imports: [ConfigModule.forFeature(usersConfig), PrismaModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
