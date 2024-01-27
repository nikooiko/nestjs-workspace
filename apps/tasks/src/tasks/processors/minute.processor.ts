import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { LOGGER } from '@app/core/logger/factories/logger.factory';

@Processor('tasks')
export class MinuteProcessor {
  constructor(@Inject(LOGGER) private readonly logger: Logger) {}

  @Process('1min')
  handleEveryMinute(job: Job) {
    this.logger.debug('Start processing...', { type: 'MINUTE_TASK_STARTED' });
    this.logger.debug(JSON.stringify(job));
    this.logger.debug('Processing completed', { type: 'MINUTE_TASK_FINISHED' });
  }
}
