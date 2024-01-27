import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Logger } from 'winston';
import { LoggerModule } from '@app/core/logger/logger.module';
import { CookiesModule } from '@app/core/cookies/cookies.module';
import { RedisModule } from '@app/core/redis/redis.module';
import { LOGGER } from '@app/core/logger/factories/logger.factory';
import { AppController } from './app.controller';
import { ValidationModule } from '@app/core/validation/validation.module';
import { ErrorHandlingModule } from '@app/core/error-handling/error-handling.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule /* global */,
    ErrorHandlingModule,
    ValidationModule,
    CookiesModule,
    RedisModule,
  ],
  controllers: [AppController],
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
