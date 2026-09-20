import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';

@Controller('webhooks/telegram')
export class TelegramController {
  constructor(
    private readonly config: ConfigService,
    private readonly telegram: TelegramService,
  ) {}

  @Post()
  async handle(
    @Headers('x-telegram-bot-api-secret-token') secret: string | undefined,
    @Body() update: { message?: { chat?: { id?: number }; text?: string } },
  ) {
    const expected = this.config.get<string>('TELEGRAM_WEBHOOK_SECRET');
    if (expected && secret !== expected) {
      throw new UnauthorizedException('Invalid Telegram webhook secret');
    }
    await this.telegram.handleUpdate(update);
    return { ok: true };
  }
}
