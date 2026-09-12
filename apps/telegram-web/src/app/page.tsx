'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingPage } from '@majara/ui';
import type { AuthSession } from '@majara/types';
import { api, setToken } from '@/lib/api';
import { getBotUsernames } from '@/lib/channel';

type TelegramWebApp = {
  initData?: string;
  initDataUnsafe?: { user?: unknown };
  ready?: () => void;
  expand?: () => void;
};

function readTelegramWebApp() {
  return (window as Window & { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
}

/**
 * Telegram puts the signed payload in the location hash before its SDK is ready.
 * Using it as a fallback keeps the login flow reliable when the SDK is delayed.
 */
function readTelegramInitData() {
  if (typeof window === 'undefined') return '';
  const fromSdk = readTelegramWebApp()?.initData;
  if (fromSdk) return fromSdk;

  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return hash.get('tgWebAppData') ?? '';
}

function isTelegramMiniApp() {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash ?? '';
  if (hash.includes('tgWebAppData') || hash.includes('tgWebAppVersion')) return true;
  const webApp = readTelegramWebApp();
  return Boolean(webApp?.initData || webApp?.initDataUnsafe?.user);
}

async function enterApp(
  router: ReturnType<typeof useRouter>,
  initData: string,
  webApp?: TelegramWebApp,
) {
  webApp?.ready?.();
  webApp?.expand?.();
  const session = await api<AuthSession>('/auth/telegram', {
    method: 'POST',
    body: JSON.stringify({ initData }),
  });
  setToken(session.token);
  router.replace('/magazines');
}

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const bots = getBotUsernames();

  useEffect(() => {
    let cancelled = false;
    let tries = 0;

    const id = window.setInterval(() => {
      tries += 1;
      const webApp = readTelegramWebApp();
      const initData = readTelegramInitData();
      if (initData) {
        window.clearInterval(id);
        void enterApp(router, initData, webApp).catch(() => {
          if (!cancelled) {
            setError('ورود امن از Telegram انجام نشد. لطفاً Mini App را دوباره باز کنید.');
            setReady(true);
          }
        });
        return;
      }
      if (tries > 200) {
        window.clearInterval(id);
        if (!cancelled) {
          if (isTelegramMiniApp()) {
            setError('اطلاعات ورود Telegram دریافت نشد. لطفاً Mini App را دوباره باز کنید.');
          }
          setReady(true);
        }
      }
    }, 50);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="majara-kraft-bg flex min-h-dvh items-center justify-center text-[var(--majara-muted)]">
        در حال ورود...
      </div>
    );
  }

  if (error) {
    return (
      <div className="majara-kraft-bg flex min-h-dvh items-center justify-center px-6 text-center text-sm text-[var(--majara-red)]">
        {error}
      </div>
    );
  }

  return (
    <LandingPage
      telegramBotUsername={bots.telegram}
      baleBotUsername={bots.bale}
      footerAdHref={process.env.NEXT_PUBLIC_FOOTER_AD_HREF}
      logoSrc="/brand/logo.png"
      footerAdSrc="/brand/footer-ad.svg"
    />
  );
}
