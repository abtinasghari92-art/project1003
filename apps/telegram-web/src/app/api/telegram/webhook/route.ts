import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type TelegramUpdate = {
  message?: { chat?: { id?: number }; text?: string };
};

function magazineUrl(webAppUrl: string) {
  return process.env.TELEGRAM_MAGAZINE_URL ?? `${webAppUrl.replace(/\/$/, '')}/magazines`;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const requestSecret = request.headers.get('x-telegram-bot-api-secret-token');

  if (!webhookSecret || requestSecret !== webhookSecret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const chatId = update.message?.chat?.id;
  const text = update.message?.text?.trim();
  if (!chatId || !text?.startsWith('/start')) {
    return NextResponse.json({ ok: true });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const webAppUrl = process.env.TELEGRAM_WEB_URL ?? new URL(request.url).origin;
  if (!botToken) {
    console.error('[telegram-webhook] TELEGRAM_BOT_TOKEN is not configured');
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const replyMarkup = {
    inline_keyboard: [
      [{ text: '📚 مشاهده مجله', web_app: { url: magazineUrl(webAppUrl) } }],
      [{ text: '✨ ورود به مینی‌اپ ماجرا', web_app: { url: webAppUrl } }],
    ],
  };
  const welcomeText =
    'به ماجرا خوش آمدید ✨\n\n' +
    'تازه‌ترین شماره‌های مجله را ببینید، ورق بزنید و تهیه کنید.';
  const welcomeImage = process.env.TELEGRAM_WELCOME_IMAGE_URL;
  const method = welcomeImage ? 'sendPhoto' : 'sendMessage';
  const payload = welcomeImage
    ? { chat_id: chatId, photo: welcomeImage, caption: welcomeText, reply_markup: replyMarkup }
    : { chat_id: chatId, text: welcomeText, reply_markup: replyMarkup };

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.ok) return NextResponse.json({ ok: true });

    console.error('[telegram-webhook] Telegram API rejected welcome message', {
      status: response.status,
      body: await response.text(),
    });
  } catch (error) {
    console.error('[telegram-webhook] Telegram API request failed', error);
  }

  return NextResponse.json({ ok: false }, { status: 502 });
}
