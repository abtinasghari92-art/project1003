export const CHANNEL = 'TELEGRAM' as const;

export function getBotUsernames() {
  return {
    telegram: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? 'majara_bot',
    bale: process.env.NEXT_PUBLIC_BALE_BOT_USERNAME ?? 'majara_bot',
  };
}
