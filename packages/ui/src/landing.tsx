'use client';

import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';
import { DistressedMark } from './mark';

export interface LandingPageProps {
  telegramBotUsername: string;
  baleBotUsername: string;
  footerAdHref?: string;
  logoSrc?: string;
  footerAdSrc?: string;
}

const pageStyle: CSSProperties = {
  minHeight: '100dvh',
  display: 'flex',
  flexDirection: 'column',
  background: '#050505',
  color: '#f4f1ec',
  position: 'relative',
};

const mainStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2.4rem 1.25rem 1.2rem',
  gap: '1.4rem',
  zIndex: 1,
};

const logoStyle: CSSProperties = {
  width: 'min(280px, 78vw)',
  height: 'auto',
  filter: 'contrast(1.15)',
};

const actionsStyle: CSSProperties = {
  width: 'min(340px, 100%)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.7rem',
  marginTop: '0.4rem',
};

const btnBase: CSSProperties = {
  display: 'block',
  textAlign: 'center',
  textDecoration: 'none',
  borderRadius: 0,
  padding: '0.95rem 1.1rem',
  fontWeight: 700,
  fontSize: '0.95rem',
  letterSpacing: '0.02em',
};

const primaryBtn: CSSProperties = {
  ...btnBase,
  background: '#e20613',
  color: '#fff',
  border: '1px solid #e20613',
};

const secondaryBtn: CSSProperties = {
  ...btnBase,
  background: 'transparent',
  color: '#fff',
  border: '1px solid #fff',
};

const footerStyle: CSSProperties = {
  width: '100%',
  padding: 0,
  lineHeight: 0,
  background: '#000',
  zIndex: 1,
};

const adImgStyle: CSSProperties = {
  width: '100%',
  height: 'auto',
  display: 'block',
  maxHeight: 128,
  objectFit: 'cover',
};

const adFallbackStyle: CSSProperties = {
  display: 'block',
  textAlign: 'center',
  color: '#fff',
  padding: '1rem',
  fontSize: '0.8rem',
  background: '#e20613',
};

export function LandingPage({
  telegramBotUsername,
  baleBotUsername,
  footerAdHref,
  logoSrc = '/brand/logo.png',
  footerAdSrc = '/brand/footer-ad.png',
}: LandingPageProps): ReactElement {
  const [logoOk, setLogoOk] = useState(true);
  const [adOk, setAdOk] = useState(true);
  const telegramHref = `https://t.me/${telegramBotUsername}?startapp`;
  const baleHref = `https://ble.ir/${baleBotUsername}`;

  return (
    <div style={pageStyle}>
      <div className="majara-grain" />
      <main style={mainStyle}>
        {logoOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoSrc}
            alt="مجلّه ماجرا"
            style={logoStyle}
            onError={() => setLogoOk(false)}
          />
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px', color: '#e20613', fontSize: 12, letterSpacing: 4 }}>
              فصل‌نامه
            </p>
            <span style={{ fontSize: '4.6rem', display: 'block' }}>
              <DistressedMark text="مجلّه" />
            </span>
            <p
              style={{
                margin: '10px 0 0',
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                color: '#e20613',
              }}
            >
              ماجرا
            </p>
          </div>
        )}
        <p style={{ margin: 0, color: '#b9b3ad', fontSize: 13 }}>روایت‌های واقعی</p>
        <div style={actionsStyle}>
          <a href={telegramHref} style={primaryBtn}>
            ورود به ربات تلگرام
          </a>
          <a href={baleHref} style={secondaryBtn}>
            ورود به ربات بله
          </a>
        </div>
      </main>
      <footer style={footerStyle}>
        <a href={footerAdHref || '#'} aria-label="تبلیغ">
          {adOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={footerAdSrc}
              alt=""
              style={adImgStyle}
              onError={() => setAdOk(false)}
            />
          ) : (
            <span style={adFallbackStyle}>جای بنر تبلیغ</span>
          )}
        </a>
      </footer>
    </div>
  );
}
