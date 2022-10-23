import { NestFactory } from '@nestjs/core';
import { NestJSLoggerService } from '@app/core/logger/services/nestjs-logger.service';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(NestJSLoggerService));
  await app.listen(3000);
}

bootstrap();
