import { Inject, Injectable, LoggerService } from '@nestjs/common';
import winston, { Logger } from 'winston';
import { ConfigType } from '@nestjs/config';
import loggerConfig from '../config/logger.config';

@Injectable()
export class NestJSLoggerService implements LoggerService {
  private readonly logger: Logger;

  constructor(
    @Inject(loggerConfig.KEY)
    private readonly config: ConfigType<typeof loggerConfig>,
  ) {
    this.logger = winston.createLogger({
      ...config.winston,
      defaultMeta: {
        ...config.winston.defaultMeta,
        layer: 'Nest',
      },
    });
  }

  log(message: any, ...optionalParams: any[]) {
    this.customLog('info', message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.customLog('error', message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.customLog('warn', message, ...optionalParams);
  }

  debug?(message: any, ...optionalParams: any[]) {
    this.customLog('debug', message, ...optionalParams);
  }

  verbose?(message: any, ...optionalParams: any[]) {
    this.customLog('verbose', message, ...optionalParams);
  }

  private customLog(
    level: 'info' | 'error' | 'warn' | 'debug' | 'verbose',
    message: any,
    ...optionalParams: any[]
  ) {
    this.logger[level](
      message,
      this.extractMeta(optionalParams, level === 'error'),
    );
  }

  /**
   * This method extracts winston-based metadata from the optional parameters as they are provided the NestJS
   * Logger-based logging services.
   * Is based on [ConsoleLogger](https://github.com/nestjs/nest/blob/master/packages/common/services/console-logger.service.ts).
   * @param {any[]} optionalParams
   * @param {boolean} isError
   * @private
   */
  private extractMeta(optionalParams: any[], isError = false): any {
    const meta: any = {};
    if (!optionalParams) {
      return undefined;
    }
    const context = optionalParams.pop(); // last argument is expected to be the context,
    if (context) {
      meta.context = context;
    }
    if (isError) {
      // with error logs we can also expect the second to last argument (if exists, to be the error stack).
      const stack = optionalParams.pop(); // one before last argument is expected to be the context;
      if (stack) {
        meta.stack = stack;
      }
    }

    return Object.keys(meta).length ? meta : undefined;
  }
}
