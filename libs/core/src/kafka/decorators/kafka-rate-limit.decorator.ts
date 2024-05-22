import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { KafkaRateLimitOptions } from './kafka-rate-limit-options.decorator';
import { RateLimitInterceptor } from '../interceptors/rate-limit.interceptor';
import { PartialBy } from '../../generic/types/partial-by.type';

export function KafkaRateLimit(
  opts: PartialBy<
    NonNullable<Parameters<typeof KafkaRateLimitOptions>[0]>,
    'pauseDurationMs' | 'ttl'
  >,
) {
  return applyDecorators(
    KafkaRateLimitOptions({
      ...opts,
      pauseDurationMs: opts.pauseDurationMs ?? 5000, // 5 sec by default
      ttl: opts.ttl ?? 60, // 1 min default
    }),
    UseInterceptors(RateLimitInterceptor),
  );
}
