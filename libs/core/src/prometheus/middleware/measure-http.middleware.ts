import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrometheusService } from '@app/core/prometheus/services/prometheus.service';
import { Counter } from 'prom-client';

@Injectable()
export class MeasureHttp implements NestMiddleware {
  httpRequests: Counter;

  constructor(private prometheus: PrometheusService) {
    this.httpRequests = this.prometheus.createCounter({
      help: 'Tracks HTTP requests',
      name: 'http_requests',
      labelNames: ['method', 'url', 'statusCode'],
    });
  }

  use(req: Request, res: Response, next: () => void) {
    res.once('finish', () => {
      const { method, url } = req;
      const { statusCode } = res;
      this.httpRequests.inc({ method, url, statusCode });
    });
    next();
  }
}
