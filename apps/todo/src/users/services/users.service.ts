import { Inject, Injectable } from '@nestjs/common';
import { Prisma, User } from '@app/todo/prisma-client';
import { LOGGER } from '@app/core/logger/factories/logger.factory';
import { Logger } from 'winston';
import bcrypt from 'bcrypt';
import { ConfigType } from '@nestjs/config';
import { PrismaService } from '../../prisma/services/prisma.service';
import usersConfig from '../config/users.config';

@Injectable()
export class UsersService {
  constructor(
    @Inject(LOGGER) private readonly logger: Logger,
    @Inject(usersConfig.KEY)
    public readonly config: ConfigType<typeof usersConfig>,
    private prisma: PrismaService,
  ) {}

  async findOne(where: Prisma.UserWhereInput): Promise<User> {
    return this.prisma.user.findFirst({
      where,
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user = await this.prisma.user.create({
      data,
    });
    this.logger.info('User created', {
      type: 'USER_CREATED',
      email: user.email,
    });
    return user;
  }

  async update({
    where,
    data,
  }: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const user = await this.prisma.user.update({
      where,
      data,
    });
    this.logger.info('User updated', {
      type: 'USER_UPDATED',
      email: user.email,
    });
    return user;
  }

  async delete(where: Prisma.UserWhereUniqueInput): Promise<User> {
    const user = await this.prisma.user.delete({
      where,
    });
    this.logger.info('User deleted', {
      type: 'USER_DELETED',
      email: user.email,
    });
    return user;
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: drop, ...userData } = user; // omit password
      return userData;
    }
    return null;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.config.password.saltOrRounds);
  }
}
