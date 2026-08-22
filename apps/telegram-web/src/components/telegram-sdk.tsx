'use client';

import { useEffect } from 'react';

export function TelegramSdk() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.async = true;
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);
  return null;
}
