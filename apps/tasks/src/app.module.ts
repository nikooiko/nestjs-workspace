import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/core/logger/logger.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [LoggerModule, TasksModule],
  providers: [],
})
export class AppModule {}
