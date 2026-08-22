'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingPage } from '@majara/ui';
import type { AuthSession } from '@majara/types';
import { api, setToken } from '@/lib/api';
import { getBotUsernames, getBaleWebApp } from '@/lib/channel';

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const bots = getBotUsernames();

  useEffect(() => {
    const webApp = getBaleWebApp();
    const initData = webApp?.initData;
    if (!initData) {
      setReady(true);
      return;
    }
    webApp?.ready?.();
    webApp?.expand?.();
    api<AuthSession>('/auth/bale', {
      method: 'POST',
      body: JSON.stringify({ initData }),
    })
      .then((session) => {
        setToken(session.token);
        router.replace('/magazines');
      })
      .catch(() => setReady(true));
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
