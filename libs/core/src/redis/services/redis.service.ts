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
  private readonly instanceId: string = crypto.randomUUID();

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
    ttl?: number,
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
    const res = await this.eval(casLua, 1, key, current, next, ttl ?? '');
    return res === 1;
  }

  async acquire(key: string, limit: number, ttl: number): Promise<number> {
    const acquireLua = `
    local key = KEYS[1]
    local instanceId = ARGV[1]
    local limit = tonumber(ARGV[2])
    local ttl = tonumber(ARGV[3])
    local now = tonumber(ARGV[4])
  
    -- iterate over the hash to calculate current count and clean up expired entries
    local count = 0 
    local instanceCount = 0
    local instancePairs = redis.call('HGETALL', key);
    for i = 1, #instancePairs, 2 do
      local id = instancePairs[i]
      local data = instancePairs[i + 1]
      local seats, expiresAt = string.match(data, '(%d+),(%d+)')
      seats = tonumber(seats)
      expiresAt = tonumber(expiresAt)
  
      if expiresAt < now then
        -- expired, remove it
        redis.call('HDEL', key, id)
      else
        count = count + seats
        -- check if this is the instance id and collect the count, it will be needed later on.
        if id == instanceId then
          instanceCount = seats 
        end
      end
    end
    
    -- check if there is space and increment the count 
    if count >= limit then
      -- no space available
      return -1 
    end
    -- there is space
    local newExpiresAt = now + ttl
    instanceCount = instanceCount + 1
    redis.call('HSET', key, instanceId, instanceCount .. ',' .. newExpiresAt)
    return count + 1 -- the semaphore's currently occupied seats
  `;
    const res = await this.eval(
      acquireLua,
      1,
      key,
      this.instanceId,
      limit,
      ttl,
      Date.now(),
    );
    return Number(res);
  }

  async release(key: string): Promise<number> {
    const releaseLua = `
    local key = KEYS[1]
    local instanceId = ARGV[1]

    -- get instance seats and expiresAt (the latter will only be used to resave it as is)
    local data = redis.call('HGET', key, instanceId) or '0,0';
    local instanceCount, expiresAt = string.match(data, '(%d+),(%d+)')
    instanceCount = tonumber(instanceCount)
    expiresAt = tonumber(expiresAt)

    if instanceCount == 0 then
      return -1 -- release didn't actually release a seat
    end
    
    -- we can release a seat
    instanceCount = instanceCount - 1
    if instanceCount == 0 then
      redis.call('HDEL', key, instanceId)
    else
      redis.call('HSET', key, instanceId, instanceCount .. ',' .. expiresAt)
    end
    return instanceCount -- the instance's currently held seats
  `;
    const res = await this.eval(releaseLua, 1, key, this.instanceId);
    return Number(res);
  }
}
