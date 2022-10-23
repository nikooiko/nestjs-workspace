import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestJSLoggerService } from '@app/core/logger/services/nestjs-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(NestJSLoggerService));
  const version = 1;
  const apiPath = `api/v${version}`;
  app.setGlobalPrefix(apiPath);
  const config = new DocumentBuilder()
    .setTitle('NoApp API')
    .setVersion(`${version}.0`)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(apiPath, app, document);
  await app.listen(3000);
}

bootstrap();
