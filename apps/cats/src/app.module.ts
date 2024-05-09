import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { Logger } from 'winston';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@app/core/logger/logger.module';
import { LOGGER } from '@app/core/logger/factories/logger.factory';
import { ValidationModule } from '@app/core/validation/validation.module';
import { ErrorHandlingModule } from '@app/core/error-handling/error-handling.module';
import { CatsSearchModule } from './cats-search/cats-search.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule /* global */,
    ErrorHandlingModule,
    ValidationModule,
    CatsSearchModule,
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(@Inject(LOGGER) private logger: Logger) {}

  onApplicationBootstrap(): any {
    this.logger.info('Application bootstrap success!', {
      type: 'APP_BOOTSTRAP',
    });
  }
}
