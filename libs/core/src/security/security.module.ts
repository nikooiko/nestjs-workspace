import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import helmet from 'helmet';
import cors from 'cors';
import { CookiesModule } from '@app/core/cookies/cookies.module';
import { ConfigModule } from '@nestjs/config';
import securityConfig from './config/security.config';
import { CsrfService } from './services/csrf.service';

// We use declaration merging to extend the express Request type to include extra fields.
// (read more at https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
declare module 'express' {
  interface Request {
    csrfId?: string; // this id will be used for CSRF token generation and validation
  }
}

@Module({
  imports: [ConfigModule.forFeature(securityConfig), CookiesModule],
  providers: [CsrfService],
  exports: [CsrfService],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(helmet(), cors()).forRoutes('*');
  }
}
