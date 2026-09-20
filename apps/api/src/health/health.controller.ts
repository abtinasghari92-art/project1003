import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  check() {
    return { ok: true, service: 'majara-api' };
  }

  @Get()
  index() {
    return {
      ok: true,
      service: 'majara-api',
      health: '/health',
    };
  }
}
