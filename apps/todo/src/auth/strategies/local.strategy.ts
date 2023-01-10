import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { UserDataDto } from '../dto/user-data.dto';
import { AppUnauthorizedException } from '@app/core/api/exceptions/app-unauthorized.exception';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<UserDataDto> {
    const user = await this.usersService.validateCredentials(email, password);
    if (!user) {
      throw new AppUnauthorizedException();
    }
    return {
      id: user.id,
    };
  }
}
