import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('cookies')
  getCookies(@Req() req: Request): any {
    return req.cookies;
  }
}
