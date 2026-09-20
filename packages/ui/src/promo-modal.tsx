'use client';

import { useEffect, useState } from 'react';
import { CloseIcon, GiftIcon } from './icons';

type ActivePromotion = {
  id: string;
  code: string;
  discountPercent: number;
  title: string;
  description: string;
  updatedAt: string;
};

export function PromoModal() {
  const [promotion, setPromotion] = useState<ActivePromotion | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const apiUrl = (window as Window & { __MAJARA_API_URL?: string }).__MAJARA_API_URL ?? 'http://localhost:4000';
    let active = true;
    void fetch(`${apiUrl}/promotion/active`)
      .then((response) => (response.ok ? response.json() : null))
      .then((campaign: ActivePromotion | null) => {
        if (!active || !campaign) return;
        try {
          if (sessionStorage.getItem(`majara-promo:${campaign.id}:${campaign.updatedAt}`)) return;
        } catch {
          return;
        }
        setPromotion(campaign);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  function dismiss() {
    if (!promotion) return;
    try {
      sessionStorage.setItem(`majara-promo:${promotion.id}:${promotion.updatedAt}`, '1');
    } catch {
      /* ignore */
    }
    setPromotion(null);
  }

  async function copyCode() {
    if (!promotion) return;
    try {
      await navigator.clipboard.writeText(promotion.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  if (!promotion) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[var(--majara-charcoal)]/70 p-5 backdrop-blur-sm">
      <div className="relative w-full max-w-[340px] overflow-hidden rounded-[28px] bg-white px-5 py-6 text-center shadow-[0_22px_50px_rgba(20,12,10,.28)]">
        <div aria-hidden className="absolute -top-14 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[var(--majara-red)]/10 blur-2xl" />
        <button
          type="button"
          onClick={dismiss}
          aria-label="بستن"
          className="absolute top-3 left-3 z-30 grid h-8 w-8 place-items-center rounded-full bg-[#f1f1f1] text-[#8a8a8a] shadow-[0_4px_10px_rgba(60,60,59,.12)]"
        >
          <CloseIcon size={14} />
        </button>
        <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-[28px] bg-[var(--majara-red)] text-white shadow-[0_14px_28px_rgba(228,37,40,.28)]">
          <GiftIcon size={62} />
        </div>
        <div className="relative mt-4">
          <p className="text-[3.5rem] font-bold leading-none text-[var(--majara-red)]">
            ٪{new Intl.NumberFormat('fa-IR').format(promotion.discountPercent)}
          </p>
          <h2 className="mt-3 text-[1.15rem] font-bold leading-7 text-[var(--majara-ink)]">
            {promotion.title}
          </h2>
          {promotion.description ? <p className="mt-2 text-[13px] leading-6 text-[#7a7572]">{promotion.description}</p> : null}
          <button
            type="button"
            onClick={() => void copyCode()}
            className="mt-5 flex w-full items-center justify-between gap-3 rounded-[18px] border-2 border-dashed border-[var(--majara-charcoal)] px-4 py-3 text-left"
          >
            <span dir="ltr" className="text-[1.2rem] font-bold tracking-[0.12em] text-[var(--majara-charcoal)]">{promotion.code}</span>
            <span className="text-[13px] font-bold text-[var(--majara-red)]">{copied ? 'کپی شد' : 'کپی کردن'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
