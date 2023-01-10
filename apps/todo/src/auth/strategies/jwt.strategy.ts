import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Request } from 'express';
import authConfig from '../config/auth.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(authConfig.KEY)
    public readonly config: ConfigType<typeof authConfig>,
  ) {
    super({
      jwtFromRequest: (req) => this.extractJwtFromCookie(req),
      ignoreExpiration: false,
      secretOrKey: config.accessToken.secret,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }

  extractJwtFromCookie(req: Request) {
    console.log('here', req.cookies);
    return req.cookies[this.config.accessToken.cookieName];
  }
}
