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

/** Mini App injects tgWebAppData in the hash even before the SDK script finishes. */
function isTelegramMiniApp() {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash ?? '';
  if (hash.includes('tgWebAppData') || hash.includes('tgWebAppVersion')) return true;
  const webApp = readTelegramWebApp();
  return Boolean(webApp?.initData || webApp?.initDataUnsafe?.user);
}

function enterApp(router: ReturnType<typeof useRouter>, webApp?: TelegramWebApp) {
  webApp?.ready?.();
  webApp?.expand?.();
  router.replace('/magazines');
  if (!webApp?.initData) return;
  void api<AuthSession>('/auth/telegram', {
    method: 'POST',
    body: JSON.stringify({ initData: webApp.initData }),
  })
    .then((session) => setToken(session.token))
    .catch(() => undefined);
}

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const bots = getBotUsernames();

  useEffect(() => {
    let cancelled = false;
    let tries = 0;

    const goMiniApp = () => {
      if (cancelled) return;
      enterApp(router, readTelegramWebApp());
    };

    if (isTelegramMiniApp()) {
      goMiniApp();
      return () => {
        cancelled = true;
      };
    }

    const id = window.setInterval(() => {
      tries += 1;
      if (isTelegramMiniApp()) {
        window.clearInterval(id);
        goMiniApp();
        return;
      }
      if (tries > 30) {
        window.clearInterval(id);
        if (!cancelled) setReady(true);
      }
    }, 50);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black text-white/60">
        در حال ورود...
      </div>
    );
  }

  return (
    <LandingPage
      telegramBotUsername={bots.telegram}
      baleBotUsername={bots.bale}
      footerAdHref={process.env.NEXT_PUBLIC_FOOTER_AD_HREF}
      logoSrc="/brand/logo.svg"
      footerAdSrc="/brand/footer-ad.svg"
    />
  );
}
