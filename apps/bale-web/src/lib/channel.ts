export const CHANNEL = 'BALE' as const;

export function getBotUsernames() {
  return {
    telegram: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? 'majara_bot',
    bale: process.env.NEXT_PUBLIC_BALE_BOT_USERNAME ?? 'majara_bot',
  };
}

type BaleWindow = Window & {
  Bale?: {
    WebApp?: {
      initData?: string;
      ready?: () => void;
      expand?: () => void;
    };
  };
};

export function getBaleWebApp() {
  if (typeof window === 'undefined') return undefined;
  return (window as BaleWindow).Bale?.WebApp;
}

/** Bale's SDK exposes the same signed launch payload after it initializes. */
export function getBaleInitData() {
  if (typeof window === 'undefined') return '';
  const fromSdk = getBaleWebApp()?.initData;
  if (fromSdk) return fromSdk;

  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return hash.get('tgWebAppData') ?? hash.get('WebAppData') ?? '';
}
