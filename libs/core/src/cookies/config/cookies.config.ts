import { registerAs } from '@nestjs/config';

export const COOKIES_CONFIG_KEY = 'cookies';

export default registerAs(COOKIES_CONFIG_KEY, () => ({
  secret: process.env.COOKIES_SECRET?.split(',') || undefined,
}));
