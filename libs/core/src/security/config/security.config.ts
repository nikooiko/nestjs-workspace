import { registerAs } from '@nestjs/config';
import { getEnvWithProdGuard } from '@app/core/env/utils/check-production-env.util';

export const SECURITY_CONFIG_KEY = 'security';

export default registerAs(SECURITY_CONFIG_KEY, () => ({
  csrf: {
    cookieName: getEnvWithProdGuard('CSRF_COOKIE_NAME') || 'x-csrf-token', // it's a good idea to prefix this with __Host- when using it in production
    clientCookieName:
      getEnvWithProdGuard('CSRF_CLIENT_COOKIE_NAME') || 'x-csrf-token-client', // this will have the token that is accessible by the client logic
    cookieOptions: {
      sameSite: 'strict' as const,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    },
    secret: getEnvWithProdGuard('CSRF_SECRET') || 'csrf-secret',
  },
}));
