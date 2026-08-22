import type { Metadata, Viewport } from 'next';
import { Lalezar, Vazirmatn } from 'next/font/google';
import { SentryInit } from '@/lib/sentry';
import './globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

const lalezar = Lalezar({
  weight: '400',
  subsets: ['arabic'],
  variable: '--font-lalezar',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ماجرا | مجله روایت‌های واقعی',
  description: 'فصل‌نامه تاریخی-سیاسی ماجرا',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111111',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} ${lalezar.variable}`}>
      <body
        style={{
          fontFamily: 'Peyda, var(--font-vazirmatn), Tahoma, sans-serif',
          ['--font-display' as string]: 'var(--font-lalezar), Peyda, Tahoma, sans-serif',
        }}
      >
        <div className="majara-grain" />
        <SentryInit />
        {children}
      </body>
    </html>
  );
}
