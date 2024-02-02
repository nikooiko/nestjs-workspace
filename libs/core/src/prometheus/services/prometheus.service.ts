import { Injectable } from '@nestjs/common';
import client, {
  Counter,
  CounterConfiguration,
  Gauge,
  GaugeConfiguration,
  Histogram,
  HistogramConfiguration,
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

  createHistogram<T extends string>(opts: HistogramConfiguration<T>) {
    return new Histogram(opts);
  }

  clearAll() {
    client.register.clear();
  }
}
