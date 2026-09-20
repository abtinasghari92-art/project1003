'use client';

import { CaretLeft } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  CATALOG_ISSUES,
  CATALOG_PIECES,
  LATEST_ISSUE,
  OPEN_ISSUE_EVENT,
  formatToman,
} from './catalog';
import type { CatalogIssue, CatalogPiece } from './catalog';
import { CatalogSearch } from './catalog-search';
import { MagazineCover } from './cover';
import { Highlight } from './highlight';
import { IssueProductCard } from './issue-card';
import { IssueDetailModal } from './issue-detail-modal';

const BOOKMARK_KEY = 'majara-bookmarks';

export type PieceCard = CatalogPiece;
export type ArchiveIssue = CatalogIssue;

export interface StorefrontHomeProps {
  latestTitle?: string;
  latestSummary?: string;
  latestMeta?: string;
  latestIssue?: number;
  latestId?: string;
  pieces?: PieceCard[];
  archive?: ArchiveIssue[];
  latestCoverSrc?: string;
  latestPriceRial?: number;
  onAddToCart?: (id: string, quantity: number) => void | Promise<void>;
  analyticsChannel?: 'TELEGRAM' | 'BALE';
}

function loadBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function useBookmarks() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(loadBookmarks());
  }, []);

  function toggle(id: string) {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return { ids, toggle };
}

function SectionHead({ title, href }: { title: ReactNode; href: string }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="text-[1.15rem] font-bold">{title}</h2>
      <a href={href} className="inline-flex items-center gap-0.5 text-sm font-bold text-[var(--majara-red)]">
        مشاهده همه
        <CaretLeft size={14} weight="bold" />
      </a>
    </div>
  );
}

export function StorefrontHome({
  latestTitle = LATEST_ISSUE.title,
  latestMeta = LATEST_ISSUE.meta,
  latestIssue = LATEST_ISSUE.number,
  latestId = LATEST_ISSUE.id,
  pieces = CATALOG_PIECES,
  archive = CATALOG_ISSUES,
  latestCoverSrc = LATEST_ISSUE.coverSrc,
  latestPriceRial = LATEST_ISSUE.priceRial,
  onAddToCart,
  analyticsChannel,
}: StorefrontHomeProps): ReactNode {
  const [query, setQuery] = useState('');
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const { ids: bookmarks, toggle: toggleBookmark } = useBookmarks();
  const needle = query.trim();
  const promo = pieces[0];

  const visibleArchive = useMemo(
    () =>
      archive.filter((issue) => {
        const haystack = `${issue.title} ${issue.season} ${issue.number} ${issue.summary}`;
        const matchesQuery = !needle || haystack.includes(needle);
        return matchesQuery;
      }),
    [archive, needle],
  );

  const showPromo =
    Boolean(promo) &&
    (!needle || `${promo.title} ${promo.summary}`.includes(needle));

  useEffect(() => {
    const openIssue = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (archive.some((issue) => issue.id === id)) setActiveIssueId(id);
    };
    window.addEventListener(OPEN_ISSUE_EVENT, openIssue);
    return () => window.removeEventListener(OPEN_ISSUE_EVENT, openIssue);
  }, [archive]);

  return (
    <div className="space-y-5 pb-4">
      <CatalogSearch query={query} onQueryChange={setQuery} placeholder="جستجوی شماره یا موضوع" />

      <button type="button" onClick={() => setActiveIssueId(latestId)} className="majara-hero-card block w-full text-right">
        <div aria-hidden className="majara-hero-card__fiber" />
        <div className="relative z-10 grid grid-cols-[108px_1fr] items-center gap-3 p-4">
          <div className="majara-hero-tilt">
            <div className="majara-hero-tilt__cover">
              <MagazineCover title={latestTitle} issue={latestIssue} imageSrc={latestCoverSrc} />
            </div>
          </div>
          <div className="min-w-0 pt-1">
            <p className="inline-flex rounded-full bg-[var(--majara-gold)] px-2.5 py-0.5 text-[10px] font-bold text-white">
              جدیدترین شماره
            </p>
            <h1 className="mt-2 text-[1.35rem] font-bold leading-[1.2]">{latestTitle}</h1>
            <p className="mt-1 text-[11px] leading-5 text-white/80">{latestMeta}</p>
            <p className="mt-2 text-[13px] font-bold text-white">{formatToman(latestPriceRial)}</p>
            <span className="mt-3 inline-flex h-9 items-center gap-1 rounded-full bg-white px-4 text-[12px] font-bold text-[var(--majara-red)] shadow-[0_6px_16px_rgba(60,60,59,.12)]">
              مشاهده و خرید
              <CaretLeft size={14} weight="bold" />
            </span>
          </div>
        </div>
      </button>

      {showPromo && promo ? (
        <a href="/preview" className="majara-promo">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[var(--majara-charcoal)] shadow-[0_6px_14px_rgba(60,60,59,.08)]">
            <CaretLeft size={16} weight="bold" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-[var(--majara-red)]">گزارش ویژه این ماه</p>
            <p className="mt-0.5 line-clamp-1 text-[13px] font-bold leading-5">{promo.title}</p>
            <p className="mt-0.5 line-clamp-1 text-[11px] leading-4 text-[var(--majara-muted)]">{promo.summary}</p>
          </div>
          {promo.imageSrc ? (
            <img
              src={promo.imageSrc}
              alt=""
              className="h-[72px] w-[72px] shrink-0 rounded-[12px] object-cover object-top"
            />
          ) : (
            <div className="majara-red-wash h-[72px] w-[72px] shrink-0 rounded-[12px]" />
          )}
        </a>
      ) : null}

      <section>
        <SectionHead
          title={
            <>
              <Highlight>تازه‌های</Highlight> منتخب
            </>
          }
          href="/archive"
        />
        {visibleArchive.length === 0 ? (
          <p className="text-[12px] text-[var(--majara-muted)]">موردی پیدا نشد.</p>
        ) : (
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
            {visibleArchive.map((issue) => (
              <IssueProductCard
                key={issue.id}
                issue={issue}
                bookmarked={bookmarks.includes(issue.id)}
                onToggleBookmark={() => toggleBookmark(issue.id)}
                onAddToCart={onAddToCart}
                onOpenIssue={(selectedIssue) => setActiveIssueId(selectedIssue.id)}
              />
            ))}
          </div>
        )}
      </section>
      {activeIssueId ? (
        <IssueDetailModal
          issues={archive}
          initialIssueId={activeIssueId}
          onClose={() => setActiveIssueId(null)}
          onAddToCart={onAddToCart}
          analyticsChannel={analyticsChannel}
        />
      ) : null}
    </div>
  );
}
