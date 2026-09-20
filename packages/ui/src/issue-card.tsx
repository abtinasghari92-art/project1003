'use client';

import { BookmarkSimple, ShoppingCartSimple } from '@phosphor-icons/react';
import { useState } from 'react';
import {
  CATEGORY_LABEL,
  formatFa,
  formatToman,
  issuePath,
  type CatalogIssue,
} from './catalog';
import { MagazineCover } from './cover';
import { QuantityPicker } from './quantity-picker';

export function IssueProductCard({
  issue,
  bookmarked,
  onToggleBookmark,
  onAddToCart,
  onOpenIssue,
}: {
  issue: CatalogIssue;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onAddToCart?: (id: string, quantity: number) => void | Promise<void>;
  onOpenIssue?: (issue: CatalogIssue) => void;
}) {
  const [quantityOpen, setQuantityOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const meta = [
    issue.season,
    issue.pageCount ? `${formatFa(issue.pageCount)} صفحه` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  async function confirmAddToCart() {
    setBusy(true);
    setError('');
    try {
      await onAddToCart?.(issue.id, quantity);
      setQuantityOpen(false);
      setQuantity(1);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'افزودن به سبد ناموفق بود');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <article className="majara-product-card">
      {onOpenIssue ? (
        <button type="button" className="block w-full text-right" onClick={() => onOpenIssue(issue)}>
          <div className="relative">
            <MagazineCover
              title={issue.title}
              issue={issue.number}
              season={issue.season}
              imageSrc={issue.coverSrc}
              bare
            />
            {issue.badge ? <span className="majara-ribbon">{issue.badge}</span> : null}
            {issue.category ? (
              <span className="majara-cover-tag">{CATEGORY_LABEL[issue.category]}</span>
            ) : null}
          </div>
          <div className="space-y-1 px-2.5 pt-2.5">
            <h3 className="line-clamp-2 text-[13px] font-bold leading-5">{issue.title}</h3>
            {meta ? <p className="text-[11px] text-[var(--majara-muted)]">{meta}</p> : null}
            <p className="majara-price text-[12px]">{formatToman(issue.priceRial)}</p>
          </div>
        </button>
      ) : (
        <a href={issuePath(issue.id)} className="block">
        <div className="relative">
          <MagazineCover
            title={issue.title}
            issue={issue.number}
            season={issue.season}
            imageSrc={issue.coverSrc}
            bare
          />
          {issue.badge ? <span className="majara-ribbon">{issue.badge}</span> : null}
          {issue.category ? (
            <span className="majara-cover-tag">{CATEGORY_LABEL[issue.category]}</span>
          ) : null}
        </div>
        <div className="space-y-1 px-2.5 pt-2.5">
          <h3 className="line-clamp-2 text-[13px] font-bold leading-5">{issue.title}</h3>
          {meta ? <p className="text-[11px] text-[var(--majara-muted)]">{meta}</p> : null}
          <p className="majara-price text-[12px]">{formatToman(issue.priceRial)}</p>
        </div>
        </a>
      )}
      <div className="mt-1 flex items-center justify-between px-2 pb-2.5">
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-full text-[var(--majara-charcoal)]"
          aria-label={bookmarked ? 'حذف نشان' : 'نشان کردن'}
          aria-pressed={bookmarked}
          onClick={onToggleBookmark}
        >
          <BookmarkSimple size={18} weight={bookmarked ? 'fill' : 'regular'} />
        </button>
        <button
          type="button"
          dir="ltr"
          className="inline-flex h-8 items-center gap-1 rounded-full bg-[var(--majara-teal)] px-2.5 text-[12px] font-bold text-white"
          aria-label="خرید"
          onClick={() => {
            setQuantity(1);
            setQuantityOpen(true);
          }}
        >
          <ShoppingCartSimple size={15} weight="bold" />
          خرید
        </button>
      </div>
      </article>
      {quantityOpen ? (
        <QuantityPicker
          title={issue.title}
          priceRial={issue.priceRial}
          quantity={quantity}
          busy={busy}
          onChange={setQuantity}
          onCancel={() => {
            if (!busy) setQuantityOpen(false);
          }}
          onConfirm={confirmAddToCart}
        />
      ) : null}
      {error ? <p className="mt-2 text-center text-[11px] text-[var(--majara-red)]">{error}</p> : null}
    </>
  );
}
