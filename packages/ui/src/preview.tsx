'use client';

import { useState } from 'react';
import { Masthead } from './masthead';
import { AboutMajara } from './about';

const PAGES = [
  {
    src: '/issues/3/cover.jpg',
    label: 'جلد',
    caption: 'شماره سوم · زمستان ۱۴۰۳ · میراث از دست رفته',
  },
  {
    src: '/issues/3/page-07.png',
    label: 'صفحه ۷',
    caption: 'فصل اول · رسانه · لنزهای جنگی',
  },
  {
    src: '/issues/3/page-14.jpg',
    label: 'صفحه ۱۴',
    caption: 'گفت‌وگو با احسان رجبی، عکاس و مستندساز جنگ',
  },
];

export function PreviewScreen() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="pb-8">
      <header className="mb-4 border-b border-black/10 pb-3">
        <p
          className="mb-1 text-3xl text-[var(--majara-red)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ماجرا
        </p>
        <p className="text-[11px] text-[var(--majara-muted)]">پیش‌نمایش شماره سوم · زمستان ۱۴۰۳</p>
      </header>

      <div className="space-y-5">
        {PAGES.map((page) => (
          <figure key={page.src} className="border border-[var(--majara-line)] bg-white">
            <button
              type="button"
              className="block w-full"
              onClick={() => setOpen(page.src)}
              aria-label={`نمایش بزرگ ${page.label}`}
            >
              <img src={page.src} alt={page.caption} className="block w-full" />
            </button>
            <figcaption className="flex items-center justify-between px-3 py-2 text-[11px]">
              <span className="font-bold text-[var(--majara-red)]">{page.label}</span>
              <span className="text-[var(--majara-muted)]">{page.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        <AboutMajara />
        <Masthead />
      </div>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-[90] overflow-y-auto bg-black/90 p-3"
          onClick={() => setOpen(null)}
          aria-label="بستن پیش‌نمایش"
        >
          <img src={open} alt="" className="mx-auto max-w-full" />
        </button>
      ) : null}
    </div>
  );
}
