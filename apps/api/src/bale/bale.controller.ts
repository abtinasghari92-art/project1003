import { Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('webhooks/bale')
export class BaleController {
  constructor(private readonly config: ConfigService) {}

  @Post()
  handle(@Headers('x-bale-secret') secret: string | undefined) {
    const expected = this.config.get<string>('BALE_WEBHOOK_SECRET');
    if (expected && secret !== expected) {
      throw new UnauthorizedException('Invalid Bale webhook secret');
    }
    return { ok: true };
  }
}
