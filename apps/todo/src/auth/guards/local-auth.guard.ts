import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppUnauthorizedException } from '@app/core/api/exceptions/app-unauthorized.exception';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err, user) {
    if (err || !user) {
      throw err || new AppUnauthorizedException();
    }
    return user;
  }
}
