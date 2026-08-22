'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingPage } from '@majara/ui';
import type { AuthSession } from '@majara/types';
import { api, setToken } from '@/lib/api';
import { getBotUsernames } from '@/lib/channel';

type TelegramWebApp = {
  initData?: string;
  ready?: () => void;
  expand?: () => void;
};

function readTelegramWebApp() {
  return (window as Window & { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
}

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const bots = getBotUsernames();

  useEffect(() => {
    let cancelled = false;
    let tries = 0;

    const finishLanding = () => {
      if (!cancelled) setReady(true);
    };

    const login = (webApp: TelegramWebApp) => {
      webApp.ready?.();
      webApp.expand?.();
      api<AuthSession>('/auth/telegram', {
        method: 'POST',
        body: JSON.stringify({ initData: webApp.initData }),
      })
        .then((session) => {
          setToken(session.token);
          router.replace('/magazines');
        })
        .catch(finishLanding);
    };

    const tick = () => {
      const webApp = readTelegramWebApp();
      if (webApp?.initData) {
        login(webApp);
        return true;
      }
      return false;
    };

    if (tick()) return () => {
      cancelled = true;
    };

    const id = window.setInterval(() => {
      tries += 1;
      if (tick() || tries > 20) {
        window.clearInterval(id);
        if (!readTelegramWebApp()?.initData) finishLanding();
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
