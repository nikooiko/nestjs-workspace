import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import helmet from 'helmet';

@Module({})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(helmet()).forRoutes('*');
  }
}
