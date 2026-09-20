import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { SentryInit } from '@/lib/sentry';
import './globals.css';

export const metadata: Metadata = {
  title: 'ماجرا | مجله روایت‌های واقعی',
  description: 'فصل‌نامه تاریخی-سیاسی ماجرا',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f4efe6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  return (
    <html lang="fa" dir="rtl">
      <body
        style={{
          fontFamily: 'Vazirmatn, Tahoma, sans-serif',
          ['--font-display' as string]: 'Vazirmatn, Tahoma, sans-serif',
          ['--font-body' as string]: 'Vazirmatn, Tahoma, sans-serif',
          ['--font-mark' as string]: 'Vazirmatn, Tahoma, sans-serif',
        }}
      >
        <Script src="https://tapi.bale.ai/miniapp.js?3" strategy="beforeInteractive" />
        <Script id="majara-api-url" strategy="beforeInteractive">
          {`window.__MAJARA_API_URL = ${JSON.stringify(apiUrl)};`}
        </Script>
        <SentryInit />
        {children}
      </body>
    </html>
  );
}
