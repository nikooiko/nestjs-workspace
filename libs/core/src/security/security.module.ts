import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import helmet from 'helmet';
import cors from 'cors';
import { CookiesModule } from '@app/core/cookies/cookies.module';

@Module({
  imports: [CookiesModule],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(helmet(), cors()).forRoutes('*');
  }
}
