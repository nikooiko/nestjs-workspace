import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigType } from '@nestjs/config';
import { Logger } from 'winston';
import loggerConfig from '../config/logger.config';
import { LOGGER } from '../factories/logger.factory';

@Injectable()
export class LogHttp implements NestMiddleware {
  constructor(
    @Inject(loggerConfig.KEY)
    private readonly config: ConfigType<typeof loggerConfig>,
    @Inject(LOGGER) private readonly logger: Logger,
  ) {}

  use(req: Request, res: Response, next: () => void) {
    const start = Date.now();
    res.once('finish', () => {
      const { method, url } = req;
      const { statusCode } = res;
      const httpConfig = this.config.http;

      const meta: any = {
        method,
        url,
        statusCode,
        responseTime: Date.now() - start,
      };
      ['body', 'query', 'cookies'].forEach(
        (field: 'body' | 'query' | 'cookies') => {
          const fieldConfig = httpConfig[field];
          const value = req[field];
          if (
            !fieldConfig.enabled ||
            !value ||
            !Object.keys(value).length ||
            JSON.stringify(value).length > (httpConfig[field].maxSize ?? 0)
          ) {
            return;
          }
          if (fieldConfig.hasOwnProperty('blackListedFields')) {
            // need to filter the output, so swallow copy the original value to avoid messing with input object
            const copy = { ...value };
            (fieldConfig as any).blackListedFields.forEach(
              (fieldName: string) => delete copy[fieldName],
            );
            meta[field] = copy;
          } else {
            meta[field] = value;
          }
        },
      );
      this.logger.http(`${method} ${url} finished with ${statusCode}`, meta);
    });
    next();
  }
}
