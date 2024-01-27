import { ConfigService, ConfigType } from '@nestjs/config';
import loggerConfig, { LOGGER_CONFIG_KEY } from '../config/logger.config';
import winston from 'winston';
import { Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';

export const LOGGER = 'logger';

export const loggerFactory = {
  provide: LOGGER,
  useFactory: (configService: ConfigService, parentClass: object) => {
    const config =
      configService.get<ConfigType<typeof loggerConfig>>(LOGGER_CONFIG_KEY);
    if (!config) {
      throw new Error('Logger configuration is not defined');
    }
    return winston.createLogger({
      ...config.winston,
      defaultMeta: {
        ...config.winston.defaultMeta,
        context: parentClass?.constructor?.name,
      },
    });
  },
  scope: Scope.TRANSIENT,
  inject: [ConfigService, INQUIRER],
};
