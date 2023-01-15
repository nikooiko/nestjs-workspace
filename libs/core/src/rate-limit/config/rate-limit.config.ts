import { registerAs } from '@nestjs/config';
import { envToNumber } from '@app/core/env/utils/env-to-number.util';

export const RATE_LIMIT_CONFIG_KEY = 'rate-limit';

export default registerAs(RATE_LIMIT_CONFIG_KEY, () => ({
  ttl: envToNumber('RATE_LIMIT_THROTTLER_TTL', 60),
  limit: envToNumber('RATE_LIMIT_THROTTLER_LIMIT', 100),
}));
