import { registerAs } from '@nestjs/config';
import { envToNumber } from '@app/core/env/utils/env-to-number.util';

export const REDIS_CONFIG_KEY = 'redis';

export default registerAs(REDIS_CONFIG_KEY, () => {
  const port = envToNumber('REDIS_PORT', 6379);
  let tls;
  if (port === 6380) {
    tls = {};
  }
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port,
    username: process.env.REDIS_USERNAME || '',
    password: process.env.REDIS_PASSWORD || '',
    db: envToNumber('REDIS_DB', 0),
    tls,
  };
});
