import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'پنل ادمین ماجرا',
  description: 'CRM عملیاتی مجله ماجرا',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111111',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <div className="majara-grain" />
        {children}
      </body>
    </html>
  );
}
