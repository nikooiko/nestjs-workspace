import { Injectable } from '@nestjs/common';
import client, {
  Counter,
  CounterConfiguration,
  Gauge,
  GaugeConfiguration,
} from 'prom-client';

@Injectable()
export class PrometheusService {
  enableDefaultMetrics() {
    client.collectDefaultMetrics();
  }

  createCounter<T extends string>(opts: CounterConfiguration<T>) {
    return new Counter(opts);
  }

  createGauge<T extends string>(opts: GaugeConfiguration<T>) {
    return new Gauge(opts);
  }
}
