'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingPage } from '@majara/ui';
import type { AuthSession } from '@majara/types';
import { api, setToken } from '@/lib/api';
import { getBotUsernames, getBaleWebApp } from '@/lib/channel';

function isBaleMiniApp() {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash ?? '';
  if (hash.includes('tgWebAppData') || hash.includes('WebAppData')) return true;
  const webApp = getBaleWebApp();
  return Boolean(webApp?.initData);
}

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const bots = getBotUsernames();

  useEffect(() => {
    const enter = () => {
      const webApp = getBaleWebApp();
      webApp?.ready?.();
      webApp?.expand?.();
      router.replace('/magazines');
      if (!webApp?.initData) return;
      void api<AuthSession>('/auth/bale', {
        method: 'POST',
        body: JSON.stringify({ initData: webApp.initData }),
      })
        .then((session) => setToken(session.token))
        .catch(() => undefined);
    };

    if (isBaleMiniApp()) {
      enter();
      return;
    }

    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      if (isBaleMiniApp()) {
        window.clearInterval(id);
        enter();
        return;
      }
      if (tries > 30) {
        window.clearInterval(id);
        setReady(true);
      }
    }, 50);

    return () => window.clearInterval(id);
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
