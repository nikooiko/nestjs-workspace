import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { concatMap, from, Observable } from 'rxjs';
import { PauseException } from '@app/core/kafka/exceptions/pause.exception';
import { Reflector } from '@nestjs/core';
import { KafkaRateLimitOptions } from '@app/core/kafka/decorators/kafka-rate-limit-options.decorator';
import { RedisService } from '@app/core/redis/services/redis.service';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector, private redis: RedisService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const semaphoreOpts = this.reflector.get(
      KafkaRateLimitOptions,
      context.getHandler(),
    );

    return from(this.acquireLock(semaphoreOpts)).pipe(
      concatMap(() => next.handle()),
      concatMap(() => from(this.redis.release(semaphoreOpts.key))),
    );
  }

  async acquireLock(
    opts: NonNullable<Parameters<typeof KafkaRateLimitOptions>[0]>,
  ): Promise<void> {
    const { key, limit, ttlMs, pauseDurationMs } = opts;
    const res = await this.redis.acquire(key, limit, ttlMs);
    if (res < 0) {
      throw new PauseException(`Reached limit for key=${key}`, pauseDurationMs);
    }
  }
}
