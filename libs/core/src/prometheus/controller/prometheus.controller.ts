import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { register } from 'prom-client';
import { Response } from 'express';

@ApiTags('Metrics')
@Controller('metrics')
export class PrometheusController {
  @Get()
  async index(@Res({ passthrough: true }) res: Response): Promise<string> {
    res.header('Content-Type', register.contentType);
    return register.metrics();
  }
}
