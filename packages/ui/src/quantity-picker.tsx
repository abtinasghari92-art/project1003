'use client';

import { Minus, Plus, X } from '@phosphor-icons/react';
import { formatFa, formatToman } from './catalog';

export function QuantityPicker({
  title,
  priceRial,
  quantity,
  busy = false,
  onChange,
  onCancel,
  onConfirm,
}: {
  title: string;
  priceRial?: number;
  quantity: number;
  busy?: boolean;
  onChange: (quantity: number) => void;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 px-3 pb-20" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-[24px] bg-[var(--majara-paper)] p-5 shadow-[0_-12px_40px_rgba(60,60,59,.2)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quantity-picker-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="quantity-picker-title" className="text-lg font-bold">
            انتخاب تعداد
          </h2>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full bg-white text-[var(--majara-charcoal)]"
            aria-label="بستن"
            onClick={onCancel}
            disabled={busy}
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] bg-white px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{title}</p>
            {priceRial != null ? (
              <p className="mt-1 text-xs text-[var(--majara-muted)]">{formatToman(priceRial)} برای هر نسخه</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-full border border-[var(--majara-charcoal)]/15 px-2 py-1">
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-full bg-[var(--majara-paper)] text-[var(--majara-charcoal)] disabled:opacity-40"
              aria-label="کم کردن تعداد"
              onClick={() => onChange(Math.max(1, quantity - 1))}
              disabled={busy || quantity <= 1}
            >
              <Minus size={16} weight="bold" />
            </button>
            <span className="min-w-6 text-center text-base font-bold" aria-live="polite">
              {formatFa(quantity)}
            </span>
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-full bg-[var(--majara-red)] text-white"
              aria-label="زیاد کردن تعداد"
              onClick={() => onChange(quantity + 1)}
              disabled={busy}
            >
              <Plus size={16} weight="bold" />
            </button>
          </div>
        </div>
        <button
          type="button"
          className="mt-4 flex h-12 w-full items-center justify-center rounded-[18px] bg-[var(--majara-teal)] text-sm font-bold text-white disabled:opacity-50"
          onClick={() => void onConfirm()}
          disabled={busy}
        >
          {busy ? 'در حال افزودن...' : `افزودن ${formatFa(quantity)} نسخه به سبد`}
        </button>
      </div>
    </div>
  );
}
