import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CookiesModule } from '@app/core/cookies/cookies.module';
import authConfig, { AUTH_CONFIG_KEY } from './config/auth.config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from './services/auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config =
          configService.get<ConfigType<typeof authConfig>>(AUTH_CONFIG_KEY);
        return { secret: config.accessToken.secret };
      },
      inject: [ConfigService],
    }),
    PassportModule,
    CookiesModule,
    PrismaModule,
    UsersModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
