import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigType } from '@nestjs/config';
import { Logger } from 'winston';
import redisConfig from '../config/redis.config';
import { LOGGER } from '../../logger/factories/logger.factory';

/**
 * This service should be used by modules that require direct access to ioredis client. The rest should use
 * redis microservice.
 */
@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor(
    @Inject(redisConfig.KEY)
    private readonly serviceConfig: ConfigType<typeof redisConfig>,
    @Inject(LOGGER) private logger: Logger,
  ) {
    super({ ...serviceConfig });

    this.on('connect', this.handleConnect.bind(this));
    this.on('ready', this.handleReady.bind(this));
    this.on('error', this.handleError.bind(this));
    this.on('close', this.handleClose.bind(this));
    this.on('reconnecting', this.handleReconnecting.bind(this));
    this.on('end', this.handleEnd.bind(this));
  }

  onModuleDestroy() {
    this.disconnect(false);
  }

  private handleConnect() {
    this.logger.info('Redis connecting...', { type: 'REDIS_CONNECTING' });
  }

  private handleReady() {
    this.logger.info('Redis connected!', { type: 'REDIS_CONNECTED' });
  }

  private handleClose() {
    this.logger.warn('Redis disconnected!', { type: 'REDIS_DISCONNECTED' });
  }

  private handleReconnecting() {
    this.logger.info('Redis reconnecting!', { type: 'REDIS_RECONNECTING' });
  }

  private handleEnd() {
    this.logger.warn('Redis connection ended!', { type: 'REDIS_CONN_ENDED' });
  }

  private handleError(err: any) {
    this.logger.error('Redis error occurred!', { type: 'REDIS_ERROR', err });
  }

  /**
   * Implements the classic compare and swap mechanism.
   * @Example
   * // compareAndSwap('lock', 'key', 'key', 10000) to set lock=key for 10sec if previously equals key
   * @Example
   * // comparesAndSwap('lock', 'key', '') to unset "lock" if previously equals key
   *
   * @param key
   * @param current
   * @param next
   * @param ttl
   */
  async compareAndSwap(
    key: string,
    current: string,
    next: string,
    ttl: number,
  ): Promise<boolean> {
    const casLua = `     
      local key = KEYS[1]
      local current = ARGV[1]
      local next = ARGV[2]
      local ttl = ARGV[3]
      if redis.call("EXISTS", key) ~= 0 and redis.call("GET", key) ~= current then
        return 0
      end
      if next == "" then
        redis.call("DEL", key)
      else
        redis.call("SET", key, next)
        if ttl ~= "" then
          redis.call("PEXPIRE", key, ttl)
        end
      end
      return 1
    `;
    const res = await this.eval(casLua, 1, key, current, next, ttl);
    return res === 1;
  }

  async acquire(key: string, limit: number, ttl: number): Promise<number> {
    const acquireLua = `
      local key = KEYS[1]
      local limit = tonumber(ARGV[1])
      local ttl = ARGV[2]
      local current = tonumber(redis.call("GET", key) or "0")
      if current >= limit then
        return -1;
      end
      current = current + 1
      redis.call("SET", key, current)
      if ttl ~= "" then
        redis.call("PEXPIRE", key, tonumber(ttl))
      end
      return current
    `;
    const res = await this.eval(acquireLua, 1, key, limit, ttl);
    return Number(res);
  }

  async release(key: string): Promise<number> {
    const releaseLua = `
      local key = KEYS[1]
      local current = tonumber(redis.call("GET", key) or "0")
      if current == 0 then
        return 0
      end
      current = current - 1
      redis.call("SET", key, current, "KEEPTTL")
      return current
    `;
    const res = await this.eval(releaseLua, 1, key);
    return Number(res);
  }
}
