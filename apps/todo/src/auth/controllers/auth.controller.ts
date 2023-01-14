import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';
import authConfig from '../config/auth.config';
import { ConfigType } from '@nestjs/config';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ApiAppUnauthorizedResponse } from '@app/core/api/decorators/api-app-unauthorized-response.decorator';
import { ApiAppBadRequestResponse } from '@app/core/api/decorators/api-app-bad-request-response.decorator';
import { AuthUser } from '../decorators/auth-user.decorator';
import { AuthGuard } from '../decorators/auth-guard.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(authConfig.KEY)
    public readonly config: ConfigType<typeof authConfig>,
    private authService: AuthService,
  ) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Registers user.',
  })
  @ApiBody({
    type: RegisterDto,
  })
  @ApiCreatedResponse()
  @ApiAppBadRequestResponse()
  async register(@Body() data: RegisterDto, @Res({ passthrough: true }) res) {
    const { accessToken } = await this.authService.register(data);
    this.authService.setCookie(res, accessToken);
  }

  @Post('login')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Authenticates the user.',
  })
  @ApiBody({
    description: 'Credentials',
    type: LoginDto,
  })
  @ApiNoContentResponse()
  @ApiAppUnauthorizedResponse()
  @ApiAppBadRequestResponse()
  @UseGuards(LocalAuthGuard)
  async login(@AuthUser() user, @Res({ passthrough: true }) res) {
    const { accessToken } = await this.authService.login(user);
    this.authService.setCookie(res, accessToken);
  }

  @Post('logout')
  @HttpCode(204)
  @ApiOperation({
    summary: "Ends user's session.",
  })
  @ApiNoContentResponse()
  @AuthGuard()
  async logout(@Res({ passthrough: true }) res) {
    res.clearCookie(this.config.accessToken.cookieName);
  }
}
