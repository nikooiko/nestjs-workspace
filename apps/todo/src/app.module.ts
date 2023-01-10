import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { Logger } from 'winston';
import { ConfigModule } from '@nestjs/config';
import { CookiesModule } from '@app/core/cookies/cookies.module';
import { RedisModule } from '@app/core/redis/redis.module';
import { LoggerModule } from '@app/core/logger/logger.module';
import { LOGGER } from '@app/core/logger/factories/logger.factory';
import { ValidationModule } from '@app/core/validation/validation.module';
import { TodoModule } from './todo/todo.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule /* global */,
    ValidationModule,
    CookiesModule,
    RedisModule,
    AuthModule,
    UsersModule,
    TodoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(@Inject(LOGGER) private logger: Logger) {}

  onApplicationBootstrap(): any {
    this.logger.info('Application bootstrap success!', {
      type: 'APP_BOOTSTRAP',
    });
  }
}
