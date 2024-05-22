import { ArgumentsHost, Catch, Inject } from '@nestjs/common';
import { BaseRpcExceptionFilter, KafkaContext } from '@nestjs/microservices';
import { from, of } from 'rxjs';
import { Logger } from 'winston';
import { LOGGER } from '@app/core/logger/factories/logger.factory';
import { PauseException } from '@app/core/kafka/exceptions/pause.exception';

@Catch()
export class AllExceptionsFilter extends BaseRpcExceptionFilter {
  constructor(@Inject(LOGGER) private logger: Logger) {
    super();
  }

  catch(err: Error, host: ArgumentsHost) {
    const ctx = host.switchToRpc().getContext<KafkaContext>();
    if (err instanceof PauseException) {
      return this.pause(ctx, err.pauseDurationMs);
    }
    this.logger.error('Error consuming message. Could send to DLQ!', {
      type: 'KAFKA_EXCEPTION',
      topic: ctx.getTopic(),
      msg: JSON.stringify(ctx.getMessage()),
      err,
    });
    return from(this.commitMessage(ctx));
  }

  async commitMessage(ctx: KafkaContext) {
    const consumer = ctx.getConsumer();
    const { offset } = ctx.getMessage();
    const topic = ctx.getTopic();
    const partition = ctx.getPartition();
    await consumer.commitOffsets([
      { topic, partition, offset: (Number(offset) + 1).toString() },
    ]);
  }

  pause(ctx: KafkaContext, pauseDurationMs: number) {
    const consumer = ctx.getConsumer();
    const topic = ctx.getTopic();
    const partition = ctx.getPartition();
    const pausedPartitions = consumer.paused();
    const isPaused = pausedPartitions.some(
      (p) => p.topic === topic && p.partitions.includes(partition),
    );
    if (!isPaused) {
      this.logger.warn('Pausing consumer topic', {
        key: 'KAFKA_PAUSING_TOPIC',
        topic,
      });
      consumer.pause([{ topic }]);
      setTimeout(() => {
        consumer.resume([{ topic }]);
        this.logger.info('Resumed consumer topic', {
          key: 'KAFKA_RESUMED_TOPIC',
          topic,
        });
      }, pauseDurationMs); // Pause for the specified duration
    }
    return of(null); // no commit
  }
}
