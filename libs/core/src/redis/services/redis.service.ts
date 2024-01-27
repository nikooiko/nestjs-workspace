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
}
