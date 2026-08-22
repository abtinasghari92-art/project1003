import { Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('webhooks/telegram')
export class TelegramController {
  constructor(private readonly config: ConfigService) {}

  @Post()
  handle(
    @Headers('x-telegram-bot-api-secret-token') secret: string | undefined,
  ) {
    const expected = this.config.get<string>('TELEGRAM_WEBHOOK_SECRET');
    if (expected && secret !== expected) {
      throw new UnauthorizedException('Invalid Telegram webhook secret');
    }
    return { ok: true };
  }
}
