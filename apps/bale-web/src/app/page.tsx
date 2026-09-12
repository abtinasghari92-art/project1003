'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingPage } from '@majara/ui';
import type { AuthSession } from '@majara/types';
import { api, setToken } from '@/lib/api';
import { getBotUsernames, getBaleInitData, getBaleWebApp } from '@/lib/channel';

function isBaleMiniApp() {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash ?? '';
  if (hash.includes('tgWebAppData') || hash.includes('WebAppData')) return true;
  return Boolean(getBaleInitData());
}

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const bots = getBotUsernames();

  useEffect(() => {
    const enter = async () => {
      const webApp = getBaleWebApp();
      const initData = getBaleInitData();
      if (!initData) return false;
      webApp?.ready?.();
      webApp?.expand?.();
      const session = await api<AuthSession>('/auth/bale', {
        method: 'POST',
        body: JSON.stringify({ initData }),
      });
      setToken(session.token);
      router.replace('/magazines');
      return true;
    };

    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      if (getBaleInitData()) {
        window.clearInterval(id);
        void enter().catch(() => {
          setError('ورود امن از بله انجام نشد. لطفاً Mini App را دوباره باز کنید.');
          setReady(true);
        });
        return;
      }
      if (tries > 200) {
        window.clearInterval(id);
        if (isBaleMiniApp()) {
          setError('اطلاعات ورود بله دریافت نشد. لطفاً Mini App را دوباره باز کنید.');
        }
        setReady(true);
      }
    }, 50);

    return () => window.clearInterval(id);
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
