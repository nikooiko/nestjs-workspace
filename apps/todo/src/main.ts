import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestJSLoggerService } from '@app/core/logger/services/nestjs-logger.service';
import { AppModule } from './app.module';
import { AUTH_COOKIE_NAME } from './auth/constants/auth-cookie-name.constant';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(NestJSLoggerService));
  const version = 1;
  const apiPath = `api/v${version}`;
  app.setGlobalPrefix(apiPath);
  const config = new DocumentBuilder()
    .setTitle('Todo API')
    .setVersion(`${version}.0`)
    .addCookieAuth(AUTH_COOKIE_NAME)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(apiPath, app, document);
  await app.listen(3000);
}

bootstrap();
