import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDataDto } from '../dto/user-data.dto';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserDataDto => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
