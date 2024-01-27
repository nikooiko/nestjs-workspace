import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { RedisModule } from '@app/core/redis/redis.module';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import redisConfig, {
  REDIS_CONFIG_KEY,
} from '@app/core/redis/config/redis.config';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { LOGGER } from '@app/core/logger/factories/logger.factory';
import { Logger } from 'winston';
import { Queue } from 'bull';

@Module({
  imports: [
    RedisModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config =
          configService.get<ConfigType<typeof redisConfig>>(REDIS_CONFIG_KEY);
        if (!config) {
          throw new Error('Redis configuration is not defined');
        }
        return {
          redis: config,
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'tasks',
    }),
  ],
})
export class TasksModule implements OnApplicationBootstrap {
  constructor(
    @Inject(LOGGER) private logger: Logger,
    @InjectQueue('tasks') private tasksQ: Queue,
  ) {}

  async onApplicationBootstrap() {
    await this.tasksQ.add(
      '1min',
      {},
      {
        jobId: '1min',
        removeOnComplete: 3,
        removeOnFail: 60,
        repeat: {
          cron: '*/1 * * * *',
        },
      },
    );
    this.logger.info('Tasks bootstrap success!', {
      type: 'TASKS_BOOTSTRAP',
    });
  }
}
