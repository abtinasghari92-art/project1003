'use client';

import { useState } from 'react';

export function MagazineCover({
  title = 'میراث از دست رفته',
  issue = 3,
  season = 'زمستان ۱۴۰۳',
  imageSrc,
  bare = false,
}: {
  title?: string;
  issue?: number;
  season?: string;
  imageSrc?: string;
  bare?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(imageSrc) && !broken;
  const frame = {
    position: 'relative' as const,
    width: '100%',
    aspectRatio: '3 / 4.2',
    overflow: 'hidden',
    borderRadius: bare ? '16px 16px 0 0' : 16,
    background: '#3c3c3b',
    boxShadow: bare ? 'none' : '0 10px 22px rgba(60,60,59,.16)',
  };

  if (showImage) {
    return (
      <div style={frame}>
        <img
          src={imageSrc}
          alt={`${title} — شماره ${issue}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={() => setBroken(true)}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        ...frame,
        background: 'radial-gradient(120% 80% at 50% 20%, #5a534c 0%, #3c3c3b 42%, #2a2a29 100%)',
        color: '#fff',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          left: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          fontSize: 10,
          borderBottom: '1px solid rgba(255,255,255,.45)',
          paddingBottom: 6,
        }}
      >
        <span style={{ color: '#e42528', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>
          ماجرا
        </span>
        <span style={{ opacity: 0.85 }}>تاریخی · سیاسی</span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 8,
          top: 48,
          bottom: 56,
          width: 18,
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          fontSize: 10,
          letterSpacing: 1,
          opacity: 0.8,
        }}
      >
        شماره {issue} · {season}
      </div>
      <div
        style={{
          position: 'absolute',
          right: 10,
          bottom: 14,
          left: 32,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: '#e42528',
            borderRadius: 8,
            display: 'grid',
            placeItems: 'center',
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          {issue}
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1.05,
          }}
        >
          {title}
        </p>
      </div>
    </div>
  );
}
