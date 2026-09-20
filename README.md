# ماجرا — مونورپو Mini App

فصل‌نامه تاریخی-سیاسی ماجرا: فرانت تلگرام روی Vercel، فرانت بله و Core API روی لیارا.

## ساختار

```text
apps/telegram-web   Next.js 15  → Vercel
apps/bale-web       Next.js 15  → Liara
apps/api            NestJS + Prisma → Liara
packages/types      DTO مشترک
packages/utils      HMAC، OTP، موبایل
packages/ui         تم ماجرا + صفحه فرود
```

## اجرا محلی

```bash
cp .env.example .env
cp .env.example apps/api/.env
docker compose up -d postgres
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

- API: http://localhost:4000
- Telegram web: http://localhost:3000
- Bale web: http://localhost:3001

## ارائه‌دهنده‌ها

- OTP: کاوه‌نگار `verify/lookup`
- درگاه ریالی: زیبال (`ZIBAL_MERCHANT=zibal` برای سندباکس)
- کریپتو: NowPayments روی مینی‌اپ تلگرام (پیش‌فرض `usdttrc20`). در بله فقط پرداخت بانکی است.

برای پرداخت ریالی کاربر باید اول شماره را با OTP تایید کند.

## پیام `/start` تلگرام

با ارسال `/start`، ربات یک پیام خوش‌آمد (در صورت تنظیم بودن، همراه تصویر) و دو دکمه نشان می‌دهد: «مشاهده مجله» و «ورود به مینی‌اپ ماجرا». وب‌هوک این پیام روی Vercel و در مسیر `/api/telegram/webhook` اجرا می‌شود تا وابسته به اتصال Liara به Telegram نباشد. مقادیر زیر را به‌صورت server-only در Environment Variables پروژهٔ `telegram-web` روی Vercel تنظیم کنید:

```env
TELEGRAM_BOT_TOKEN=...
TELEGRAM_WEB_URL=https://your-telegram-mini-app.example
TELEGRAM_WELCOME_IMAGE_URL=https://your-cdn.example/welcome.jpg
# اختیاری؛ در حالت پیش‌فرض، مسیر /magazines همان مینی‌اپ باز می‌شود.
TELEGRAM_MAGAZINE_URL=https://your-telegram-mini-app.example/magazines
TELEGRAM_WEBHOOK_SECRET=...
```

وب‌هوک ربات باید به `POST https://telegram.majaraamag.ir/api/telegram/webhook` متصل باشد و `TELEGRAM_WEBHOOK_SECRET` آن باید با مقدار Vercel یکسان باشد. دکمه‌های `web_app` فقط در گفت‌وگوی خصوصی با ربات تلگرام کار می‌کنند.

## دارایی برند

`apps/*/public/brand/logo.png` و `footer-ad.png` و فایل‌های w_Zar در `public/fonts/zar/`.
تا قبل از قرارگیری فایل واقعی، SVG و Vazirmatn استفاده می‌شود.

## دیپلوی Vercel (telegram-web)

مونورپو است؛ Root Directory را روی اپ Next بگذارید وگرنه Vercel `package.json` ریشه را می‌بیند که `next` ندارد.

1. Vercel → Project → **Settings** → **General** → **Root Directory**
2. مقدار: `apps/telegram-web`
3. Save و Redeploy

Framework Preset: Next.js
