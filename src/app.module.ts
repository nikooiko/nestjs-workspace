import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CookiesModule } from '@app/core/cookies/cookies.module';
import { RedisModule } from '@app/core/redis/redis.module';

@Module({
  imports: [CookiesModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
