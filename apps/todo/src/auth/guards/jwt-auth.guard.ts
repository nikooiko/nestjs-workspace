import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppUnauthorizedException } from '@app/core/error-handling/exceptions/app-unauthorized.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: Error, user: any) {
    if (err || !user) {
      throw err || new AppUnauthorizedException();
    }
    return user;
  }
}
