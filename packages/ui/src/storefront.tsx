'use client';

import type { ReactNode } from 'react';
import { MagazineCover } from './cover';

export interface PieceCard {
  id: string;
  title: string;
  summary: string;
  imageSrc?: string;
}

export interface ArchiveIssue {
  id: string;
  number: number;
  title: string;
  season: string;
  coverSrc?: string;
}

export interface StorefrontHomeProps {
  latestTitle?: string;
  latestSummary?: string;
  latestMeta?: string;
  latestIssue?: number;
  pieces?: PieceCard[];
  archive?: ArchiveIssue[];
  onBuy?: () => void;
  onPreview?: () => void;
  onFavorite?: () => void;
  viewAllHref?: string;
  archiveHref?: string;
  latestCoverSrc?: string;
}

const DEFAULT_PIECES: PieceCard[] = [
  {
    id: '1',
    title: 'عزت بگوویچ گفت همه درها را به روی ما بسته‌اند',
    summary: 'گفت‌وگو با احسان رجبی، عکاس و مستندساز جنگ.',
    imageSrc: '/issues/3/page-14.jpg',
  },
  {
    id: '2',
    title: 'لنزهای جنگی',
    summary: 'فصل اول · رسانه؛ حضور عکاسان ایرانی در جنگ بوسنی.',
    imageSrc: '/issues/3/page-07.png',
  },
  {
    id: '3',
    title: 'میراث از دست رفته',
    summary: 'چرا ایران نمی‌تواند از نقش خود در نجات بوسنی بهره‌برداری کند؟',
    imageSrc: '/issues/3/cover-card.jpg',
  },
];

const DEFAULT_ARCHIVE: ArchiveIssue[] = [
  {
    id: '3',
    number: 3,
    title: 'میراث از دست رفته',
    season: 'زمستان ۱۴۰۳',
    coverSrc: '/issues/3/cover-card.jpg',
  },
  { id: '2', number: 2, title: 'عملیات در اروپا', season: 'پاییز ۱۴۰۳' },
  { id: '1', number: 1, title: 'شماره اول', season: 'تابستان ۱۴۰۳' },
];

function SectionHead({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="text-[1.35rem] font-bold">{title}</h2>
      <a href={href} className="text-sm font-bold text-[var(--majara-red)]">
        مشاهده همه ›
      </a>
    </div>
  );
}

export function StorefrontHome({
  latestTitle = 'میراث از دست رفته',
  latestSummary = 'فصل‌نامه تاریخی-سیاسی؛ روایتی از جنگ بوسنی تا انتهای ماجرا راهیست طولانی.',
  latestMeta = 'شماره سوم | زمستان ۱۴۰۳ | ۲۰۰ صفحه',
  latestIssue = 3,
  pieces = DEFAULT_PIECES,
  archive = DEFAULT_ARCHIVE,
  onBuy,
  onPreview,
  onFavorite,
  viewAllHref = '/preview',
  archiveHref = '/archive',
  latestCoverSrc = '/issues/3/cover-card.jpg',
}: StorefrontHomeProps): ReactNode {
  return (
    <div className="space-y-8 pb-4">
      <section className="grid grid-cols-[0.92fr_1.08fr] items-start gap-3">
        <MagazineCover title={latestTitle} issue={latestIssue} imageSrc={latestCoverSrc} />
        <div className="pt-1">
          <p className="mb-1 text-[11px] font-bold tracking-wide text-[var(--majara-red)]">
            جدیدترین شماره
          </p>
          <h1 className="mb-2 font-[family-name:var(--font-display)] text-[1.7rem] leading-[1.15]">
            {latestTitle}
          </h1>
          <p className="mb-2 text-[12px] leading-6 text-[var(--majara-muted)]">{latestSummary}</p>
          <p className="mb-3 text-[11px] text-[var(--majara-muted)]">{latestMeta}</p>
          <button
            type="button"
            onClick={onBuy}
            className="mb-2 flex h-11 w-full items-center justify-center gap-1 bg-[var(--majara-red)] text-[13px] font-bold text-white"
          >
            مشاهده و خرید
            <span aria-hidden>‹</span>
          </button>
          <button
            type="button"
            onClick={onPreview}
            className="mb-2 flex h-10 w-full items-center justify-center gap-2 bg-[#ece7e1] text-[13px] font-bold"
          >
            <span aria-hidden>◉</span>
            پیش نمایش
          </button>
          <button
            type="button"
            onClick={onFavorite}
            className="text-[12px] text-[var(--majara-muted)]"
          >
            ☆ افزودن به علاقه‌مندی
          </button>
        </div>
      </section>

      <section>
        <SectionHead title="تکه‌های ماجرا" href={viewAllHref} />
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
          {pieces.map((piece) => (
            <article
              key={piece.id}
              className="min-w-[78%] overflow-hidden border border-[var(--majara-line)] bg-white shadow-[0_8px_24px_rgba(20,6,9,.06)]"
            >
              {piece.imageSrc ? (
                <img src={piece.imageSrc} alt="" className="h-28 w-full object-cover object-top" />
              ) : (
                <div className="h-28 bg-[linear-gradient(135deg,#1c1814,#3a332c_50%,#e20613)]" />
              )}
              <div className="space-y-2 p-3">
                <h3 className="text-[13px] font-bold leading-6">{piece.title}</h3>
                <p className="text-[11px] leading-5 text-[var(--majara-muted)]">{piece.summary}</p>
                <button
                  type="button"
                  onClick={onPreview}
                  className="flex h-9 w-full items-center justify-center gap-2 border border-[var(--majara-line)] text-[12px]"
                >
                  پیش نمایش
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <SectionHead title="آرشیو" href={archiveHref} />
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
          {archive.map((issue) => (
            <a key={issue.id} href={archiveHref} className="min-w-[108px]">
              <div className="relative">
                <MagazineCover
                  title={issue.title}
                  issue={issue.number}
                  season={issue.season}
                  imageSrc={issue.coverSrc}
                />
                <span className="absolute top-2 right-2 grid h-6 w-6 place-items-center rounded-full bg-[var(--majara-red)] text-[11px] font-bold text-white">
                  {issue.number}
                </span>
              </div>
              <p className="mt-2 text-[11px] font-bold">شماره {issue.number}</p>
              <p className="text-[10px] text-[var(--majara-muted)]">{issue.season}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
