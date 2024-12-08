import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { CsrfService } from '@app/core/security/services/csrf.service';
import { AppForbiddenException } from '@app/core/error-handling/exceptions/app-forbidden.exception';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly csrf: CsrfService) {}

  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest();
    // routes must set csrfId to enable csrf protection
    if (!req.csrfId) {
      // no csrf id means no csrf protection, this is a convention to allow routes to select when they want to be protected or not.
      return true;
    }
    if (!this.csrf.validate(req)) {
      throw new AppForbiddenException();
    }
    return true;
  }
}
