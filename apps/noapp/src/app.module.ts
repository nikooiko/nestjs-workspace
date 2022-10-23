import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Logger } from 'winston';
import { LoggerModule } from '@app/core/logger/logger.module';
import { CookiesModule } from '@app/core/cookies/cookies.module';
import { RedisModule } from '@app/core/redis/redis.module';
import { LOGGER } from '@app/core/logger/factories/logger.factory';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule /* global */,
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
