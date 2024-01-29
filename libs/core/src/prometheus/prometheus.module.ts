import {
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import prometheusConfig from './config/prometheus.config';
import { PrometheusService } from '@app/core/prometheus/services/prometheus.service';
import { PrometheusController } from '@app/core/prometheus/controller/prometheus.controller';
import { MeasureHttp } from '@app/core/prometheus/middleware/measure-http.middleware';

/**
 * This module introduces a prometheus service that can enable other services to create prometheus metrics.
 *
 * You can find the current prometheus config under `config/prometheus.config.ts` and change the metrics system with
 * environment variables:
 *   - PROMETHEUS_DEFAULT_METRICS_ENABLED: By setting to 'true', you can enable prometheus default metrics
 *     (https://github.com/siimon/prom-client/tree/master/lib/metrics)
 *   - PROMETHEUS_HTTP_METRICS_ENABLED: By setting to 'true', you can enable http metrics (tracks http requests).
 *
 * Introduces a new GET /metrics endpoint that returns the enabled prometheus metrics.
 */

@Module({
  imports: [ConfigModule.forFeature(prometheusConfig)],
  providers: [PrometheusService],
  exports: [PrometheusService],
  controllers: [PrometheusController],
})
export class PrometheusModule implements NestModule, OnApplicationBootstrap {
  constructor(
    @Inject(prometheusConfig.KEY)
    private readonly config: ConfigType<typeof prometheusConfig>,
    private prometheus: PrometheusService,
  ) {}

  onApplicationBootstrap() {
    if (this.config.enableDefaultMetrics) {
      this.prometheus.enableDefaultMetrics();
    }
  }

  configure(consumer: MiddlewareConsumer): any {
    if (this.config.enableHttpMetrics) {
      consumer.apply(MeasureHttp).forRoutes('*');
    }
  }
}
