import { Reflector } from '@nestjs/core';

export const KafkaRateLimitOptions = Reflector.createDecorator<{
  key: string;
  limit: number;
  pauseDurationMs: number;
  ttl: number;
}>();
