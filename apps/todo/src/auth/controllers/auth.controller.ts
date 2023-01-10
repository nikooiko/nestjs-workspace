import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  Req,
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
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ApiAppUnauthorizedResponse } from '@app/core/api/decorators/api-app-unauthorized-response.decorator';
import { ApiAppBadRequestResponse } from '@app/core/api/decorators/api-app-bad-request-response.decorator';

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
    res.cookie(
      this.config.accessToken.cookieName,
      accessToken,
      this.config.accessToken.options,
    );
  }

  @Post('login')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Authenticates user.',
  })
  @ApiBody({
    description: 'Credentials',
    type: LoginDto,
  })
  @ApiNoContentResponse()
  @ApiAppUnauthorizedResponse()
  @ApiAppBadRequestResponse()
  @UseGuards(LocalAuthGuard)
  async login(@Req() req, @Res({ passthrough: true }) res) {
    const { accessToken } = await this.authService.login(req.user);
    res.cookie(
      this.config.accessToken.cookieName,
      accessToken,
      this.config.accessToken.options,
    );
  }

  @Post('logout')
  @HttpCode(204)
  @ApiOperation({
    summary: "Ends user's session.",
  })
  @ApiNoContentResponse()
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req, @Res({ passthrough: true }) res) {
    res.clearCookie(this.config.accessToken.cookieName);
  }
}
