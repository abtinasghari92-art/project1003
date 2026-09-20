import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type TelegramUpdate = {
  message?: { chat?: { id?: number }; text?: string };
};

function toMagazineUrl(webAppUrl: string, magazineUrl?: string) {
  if (magazineUrl) return magazineUrl;
  return `${webAppUrl.replace(/\/$/, '')}/magazines`;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly config: ConfigService) {}

  async handleUpdate(update: TelegramUpdate) {
    const text = update.message?.text?.trim();
    const chatId = update.message?.chat?.id;
    if (!chatId || !text?.startsWith('/start')) return;

    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    const webAppUrl = this.config.get<string>('TELEGRAM_WEB_URL');
    if (!token || !webAppUrl) {
      this.logger.warn('Telegram welcome message skipped: bot token or web app URL is not configured');
      return;
    }

    const magazineUrl = toMagazineUrl(
      webAppUrl,
      this.config.get<string>('TELEGRAM_MAGAZINE_URL'),
    );
    const replyMarkup = {
      inline_keyboard: [
        [{ text: '📚 مشاهده مجله', web_app: { url: magazineUrl } }],
        [{ text: '✨ ورود به مینی‌اپ ماجرا', web_app: { url: webAppUrl } }],
      ],
    };
    const welcomeImage = this.config.get<string>('TELEGRAM_WELCOME_IMAGE_URL');
    const welcomeText =
      'به ماجرا خوش آمدید ✨\n\n' +
      'تازه‌ترین شماره‌های مجله را ببینید، ورق بزنید و تهیه کنید.';
    const payload = welcomeImage
      ? {
          chat_id: chatId,
          photo: welcomeImage,
          caption: welcomeText,
          reply_markup: replyMarkup,
        }
      : {
          chat_id: chatId,
          text: welcomeText,
          reply_markup: replyMarkup,
        };
    const method = welcomeImage ? 'sendPhoto' : 'sendMessage';
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      this.logger.warn(`Telegram welcome message failed with HTTP ${response.status}`);
    }
  }
}
