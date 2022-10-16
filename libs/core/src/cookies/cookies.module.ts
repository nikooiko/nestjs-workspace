import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigModule, ConfigType } from '@nestjs/config';
import cookiesConfig from './config/cookies.config';

@Module({
  imports: [ConfigModule.forFeature(cookiesConfig)],
})
export class CookiesModule implements NestModule {
  constructor(
    @Inject(cookiesConfig.KEY)
    private readonly config: ConfigType<typeof cookiesConfig>,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser(this.config.secret)).forRoutes('*');
  }
}
