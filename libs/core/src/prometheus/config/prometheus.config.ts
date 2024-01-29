import { registerAs } from '@nestjs/config';
import { envToBoolean } from '@app/core/env/utils/env-to-boolean.util';

export const PROMETHEUS_CONFIG_KEY = 'prometheus-config';

export default registerAs(PROMETHEUS_CONFIG_KEY, () => ({
  enableDefaultMetrics: envToBoolean(
    'PROMETHEUS_DEFAULT_METRICS_ENABLED',
    false,
  ),
  enableHttpMetrics: envToBoolean('PROMETHEUS_HTTP_METRICS_ENABLED', true),
}));
