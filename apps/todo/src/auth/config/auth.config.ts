import { registerAs } from '@nestjs/config';
import { getEnvWithProdGuard } from '@app/core/env/utils/check-production-env.util';

export const AUTH_CONFIG_KEY = 'auth';

export default registerAs(AUTH_CONFIG_KEY, () => ({
  accessToken: {
    secret: getEnvWithProdGuard('ACCESS_TOKEN_SECRET') || 'access-token-secret',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
  },
}));
