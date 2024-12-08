import { Inject, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { doubleCsrf, DoubleCsrfUtilities } from 'csrf-csrf';
import { ConfigType } from '@nestjs/config';
import securityConfig from '../config/security.config';

@Injectable()
export class CsrfService {
  private readonly doubleCsrf: DoubleCsrfUtilities;

  constructor(
    @Inject(securityConfig.KEY)
    public readonly config: ConfigType<typeof securityConfig>,
  ) {
    this.doubleCsrf = doubleCsrf({
      getSecret: () => this.config.csrf.secret,
      cookieName: this.config.csrf.cookieName,
      cookieOptions: this.config.csrf.cookieOptions,
      getSessionIdentifier: (req) => req.csrfId ?? '',
    });
  }

  generate(req: Request, res: Response) {
    // generate a new token and set it in the server-side HTTP-only cookie
    const token = this.doubleCsrf.generateToken(req, res, true); // with overwrite always generates a new token.
    res.cookie(this.config.csrf.clientCookieName, token, {
      ...this.config.csrf.cookieOptions,
      httpOnly: false,
    });
  }

  validate(req: Request) {
    return this.doubleCsrf.validateRequest(req);
  }

  destroy(req: Request, res: Response) {
    // cleanup both cookies.
    res.clearCookie(
      this.config.csrf.cookieName,
      this.config.csrf.cookieOptions,
    );
    res.clearCookie(this.config.csrf.cookieName, {
      ...this.config.csrf.cookieOptions,
      httpOnly: false,
    });
  }
}
