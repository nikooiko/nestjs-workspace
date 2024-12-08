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
import { PrometheusModule } from '@app/core/prometheus/prometheus.module';
import { SecurityModule } from '@app/core/security/security.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule /* global */,
    SecurityModule /* must be imported before other modules as it applies some security-related middleware */,
    ErrorHandlingModule,
    ValidationModule,
    CookiesModule,
    RedisModule,
    PrometheusModule,
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
