import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CookiesModule } from '@app/core/cookies/cookies.module';

@Module({
  imports: [CookiesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
