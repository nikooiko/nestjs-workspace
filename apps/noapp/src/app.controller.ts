import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { PrometheusService } from '@app/core/prometheus/services/prometheus.service';
import { Counter } from 'prom-client';

@Controller()
export class AppController {
  helloWorldCounter: Counter;

  constructor(prometheus: PrometheusService) {
    this.helloWorldCounter = prometheus.createCounter({
      help: 'Counts hello world requests',
      name: 'hello_world_counter',
    });
  }

  @Get('hello')
  getHello(): string {
    this.helloWorldCounter.inc();
    return 'Hello World!';
  }

  @Get('cookies')
  getCookies(@Req() req: Request): any {
    return req.cookies;
  }
}
