import { ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';

describe('TelegramService', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = fetchMock;
    fetchMock.mockResolvedValue({ ok: true });
  });

  it('sends a welcome message with magazine and mini-app buttons after /start', async () => {
    const values: Record<string, string> = {
      TELEGRAM_BOT_TOKEN: 'bot-token',
      TELEGRAM_WEB_URL: 'https://app.majara.ir/',
    };
    const config = { get: jest.fn((key: string) => values[key]) } as unknown as ConfigService;
    const service = new TelegramService(config);

    await service.handleUpdate({ message: { chat: { id: 42 }, text: '/start' } });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.telegram.org/botbot-token/sendMessage',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          chat_id: 42,
          text: 'به ماجرا خوش آمدید ✨\n\nتازه‌ترین شماره‌های مجله را ببینید، ورق بزنید و تهیه کنید.',
          reply_markup: {
            inline_keyboard: [
              [{ text: '📚 مشاهده مجله', web_app: { url: 'https://app.majara.ir/magazines' } }],
              [{ text: '✨ ورود به مینی‌اپ ماجرا', web_app: { url: 'https://app.majara.ir/' } }],
            ],
          },
        }),
      }),
    );
  });

  it('uses a configured welcome image and custom magazine URL', async () => {
    const values: Record<string, string> = {
      TELEGRAM_BOT_TOKEN: 'bot-token',
      TELEGRAM_WEB_URL: 'https://app.majara.ir',
      TELEGRAM_WELCOME_IMAGE_URL: 'https://cdn.majara.ir/welcome.jpg',
      TELEGRAM_MAGAZINE_URL: 'https://app.majara.ir/archive',
    };
    const config = { get: jest.fn((key: string) => values[key]) } as unknown as ConfigService;
    const service = new TelegramService(config);

    await service.handleUpdate({ message: { chat: { id: 42 }, text: '/start gift' } });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.telegram.org/botbot-token/sendPhoto',
      expect.objectContaining({
        body: expect.stringContaining('https://app.majara.ir/archive'),
      }),
    );
  });
});
