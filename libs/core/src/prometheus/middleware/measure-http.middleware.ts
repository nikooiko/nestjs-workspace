import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrometheusService } from '@app/core/prometheus/services/prometheus.service';
import { Histogram } from 'prom-client';
import prometheusConfig from '@app/core/prometheus/config/prometheus.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class MeasureHttp implements NestMiddleware {
  httpRequests: Histogram;

  constructor(
    @Inject(prometheusConfig.KEY)
    private readonly config: ConfigType<typeof prometheusConfig>,
    private readonly prometheus: PrometheusService,
  ) {
    this.httpRequests = this.prometheus.createHistogram({
      help: 'Tracks HTTP requests',
      name: 'http_requests',
      labelNames: ['method', 'path', 'statusCode'],
      buckets: this.config.httpDurationBuckets,
    });
  }

  use(req: Request, res: Response, next: () => void) {
    const start = Date.now();
    res.once('finish', () => {
      const { method, route } = req;
      const { statusCode } = res;
      const duration = (Date.now() - start) / 1000;
      this.httpRequests.observe(
        {
          method,
          // utilizes route path instead of req.path to make sure is static (ie not affected by param values), the goal is to minimize cardinality
          path: route?.path || 'unmatched',
          statusCode,
        },
        duration,
      );
    });
    next();
  }
}
