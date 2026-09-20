'use client';

import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';
import { LogoMark } from './mark';

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
  backgroundColor: '#f4efe6',
  color: '#3c3c3b',
  position: 'relative',
};

const mainStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2.4rem 1.25rem 1.2rem',
  gap: '1.2rem',
  zIndex: 1,
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
  borderRadius: 16,
  padding: '0.95rem 1.1rem',
  fontWeight: 700,
  fontSize: '0.95rem',
};

const primaryBtn: CSSProperties = {
  ...btnBase,
  background: '#e42528',
  color: '#fff',
  border: '1px solid #e42528',
};

const secondaryBtn: CSSProperties = {
  ...btnBase,
  background: 'transparent',
  color: '#3c3c3b',
  border: '1px solid #3c3c3b',
};

const footerStyle: CSSProperties = {
  width: '100%',
  padding: 0,
  lineHeight: 0,
  background: '#3c3c3b',
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
  background: '#e42528',
};

export function LandingPage({
  telegramBotUsername,
  baleBotUsername,
  footerAdHref,
  logoSrc = '/brand/logo.png',
  footerAdSrc = '/brand/footer-ad.png',
}: LandingPageProps): ReactElement {
  const [adOk, setAdOk] = useState(true);
  const telegramHref = `https://t.me/${telegramBotUsername}?startapp`;
  const baleHref = `https://ble.ir/${baleBotUsername}`;

  return (
    <div style={pageStyle}>
      <main style={mainStyle}>
        <LogoMark size={92} src={logoSrc} />
        <p style={{ margin: 0, color: '#6b6562', fontSize: 13 }}>روایت‌های واقعی</p>
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
