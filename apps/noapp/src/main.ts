import { NestFactory } from '@nestjs/core';
import { NoappModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(NoappModule);
  await app.listen(3000);
}

bootstrap();
