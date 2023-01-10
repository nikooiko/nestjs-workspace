import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { mock } from 'jest-mock-extended';
import authConfig from '../config/auth.config';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const usersService = mock(UsersService);
    const jwtService = mock(JwtService);
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(authConfig)],
      providers: [AuthService, UsersService, JwtService],
    })
      .overrideProvider(JwtService)
      .useValue(jwtService)
      .overrideProvider(UsersService)
      .useValue(usersService)
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
