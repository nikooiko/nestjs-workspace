import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { AppBadRequestException } from '@app/core/error-handling/exceptions/app-bad-request.exception';
import { User } from '@app/todo/prisma-client';
import { UsersService } from '../../users/services/users.service';
import { RegisterDto } from '../dto/register.dto';
import authConfig from '../config/auth.config';
import { UserDataDto } from '../dto/user-data.dto';
import { Response } from 'express';
import { AUTH_COOKIE_NAME } from '../constants/auth-cookie-name.constant';

@Injectable()
export class AuthService {
  constructor(
    @Inject(authConfig.KEY)
    public readonly config: ConfigType<typeof authConfig>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(payload: RegisterDto): Promise<{ accessToken: string }> {
    let user: User;
    try {
      user = await this.usersService.create({
        ...payload,
        password: await this.usersService.hashPassword(payload.password),
      });
    } catch {
      throw new AppBadRequestException();
    }
    return {
      accessToken: this.jwtService.sign({
        id: user.id,
      }),
    };
  }

  async login(payload: UserDataDto): Promise<{ accessToken: string }> {
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  setCookie(res: Response, accessToken: string) {
    res.cookie(AUTH_COOKIE_NAME, accessToken, this.config.accessToken.options);
  }
}
