import { registerAs } from '@nestjs/config';

export const USERS_CONFIG_KEY = 'users';

export default registerAs(USERS_CONFIG_KEY, () => ({
  password: {
    saltOrRounds: 10,
  },
}));
