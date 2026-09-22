'use client';

import { BookmarkSimple, CaretLeft, CheckCircle, PencilSimple, Smiley, Star, ThumbsDown, ThumbsUp } from '@phosphor-icons/react';
import { FormEvent, useEffect, useState, type ReactNode } from 'react';
import {
  CATALOG_ISSUES,
  ISSUE_COMMENTS,
  ISSUE_EXCERPTS,
  LATEST_ISSUE,
  formatFa,
  formatToman,
  type CatalogComment,
  type CatalogExcerpt,
  type CatalogIssue,
} from './catalog';
import { MagazineCover } from './cover';
import { highlightFirstWord, RedWashCopy } from './highlight';
import { BrandIcon } from './brand-icon';
import { GiftIcon, ShareIcon } from './icons';
import { QuantityPicker } from './quantity-picker';
import { trackEvent, type AnalyticsChannel } from './analytics';

export interface IssueDetailScreenProps {
  issue?: CatalogIssue;
  excerpts?: CatalogExcerpt[];
  comments?: CatalogComment[];
  busy?: boolean;
  onBuy?: (quantity: number) => void | Promise<void>;
  onPreview?: () => void;
  analyticsChannel?: AnalyticsChannel;
}

const RATING_OPTIONS = [5, 4, 3, 2, 1] as const;

function Stars({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-0.5 text-[var(--majara-gold)]" aria-label={`${count} از ۵`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} size={13} weight={index < count ? 'fill' : 'regular'} />
      ))}
    </span>
  );
}

function RatingPrompt({
  stars,
  composerOpen,
  onChoose,
  onWrite,
}: {
  stars: number;
  composerOpen: boolean;
  onChoose: (stars: number) => void;
  onWrite: () => void;
}) {
  return (
    <div className="majara-rating-prompt">
      <span className="majara-rating-prompt__avatar" aria-hidden>
        <Smiley size={50} weight="fill" />
      </span>
      <p className="majara-rating-prompt__title">نظر شما چیست؟</p>
      <div className="majara-rating-prompt__stars" aria-label="امتیاز شما از پنج">
        {RATING_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={stars >= option ? 'majara-rating-prompt__star--selected' : ''}
            aria-label={`${formatFa(option)} ستاره`}
            aria-pressed={stars >= option}
            onClick={() => onChoose(option)}
          >
            <Star size={37} weight={stars >= option ? 'fill' : 'regular'} />
            <span>{formatFa(option)}</span>
          </button>
        ))}
      </div>
      <button type="button" className="majara-rating-prompt__write" onClick={onWrite}>
        <PencilSimple size={20} weight="regular" />
        {composerOpen ? 'ویرایش نظر' : 'نوشتن نظر'}
      </button>
    </div>
  );
}

function ReviewCard({ comment, onVote }: { comment: CatalogComment; onVote?: (value: 'UP' | 'DOWN') => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const [vote, setVote] = useState<'UP' | 'DOWN' | null>(null);
  const [useful, setUseful] = useState(comment.usefulCount ?? 0);
  const long = comment.body.length > 90;

  async function handleVote(value: 'UP' | 'DOWN') {
    if (vote === value) return;
    setVote(value);
    if (onVote) {
      await onVote(value);
      if (value === 'UP') setUseful((current) => current + 1);
    }
  }

  return (
    <article className="majara-review-card">
      <div className="flex items-start gap-2">
        <span className="majara-review-avatar">
          <Smiley size={22} weight="fill" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold">{comment.name}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <Stars count={comment.stars} />
            {comment.date ? (
              <span className="text-[11px] text-[var(--majara-muted)]">{comment.date}</span>
            ) : null}
          </div>
          {comment.recommended ? (
            <p className="mt-1.5 flex items-center gap-1 text-[12px] font-bold text-[#2a9d8f]">
              <CheckCircle size={15} weight="fill" />
              توصیه می‌کنم
            </p>
          ) : null}
        </div>
      </div>
      <p className={`mt-3 text-[12px] leading-6 text-[var(--majara-muted)] ${expanded || !long ? '' : 'line-clamp-3'}`}>
        {comment.body}
        {long && !expanded ? (
          <>
            {' '}
            <button
              type="button"
              className="inline font-bold text-[var(--majara-red)]"
              onClick={() => setExpanded(true)}
            >
              بیشتر
            </button>
          </>
        ) : null}
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="flex h-8 flex-1 items-center justify-center gap-1 rounded-full border border-[var(--majara-charcoal)]/18 bg-white text-[11px] font-bold"
          style={{ color: vote === 'UP' ? 'var(--majara-red)' : 'var(--majara-charcoal)' }}
          onClick={() => void handleVote('UP')}
        >
          <ThumbsUp size={13} weight={vote === 'UP' ? 'fill' : 'regular'} />
          مفید بود ({formatFa(useful)})
        </button>
        <button
          type="button"
          className="flex h-8 flex-1 items-center justify-center gap-1 rounded-full border border-[var(--majara-charcoal)]/18 bg-white text-[11px] font-bold"
          style={{ color: vote === 'DOWN' ? 'var(--majara-red)' : 'var(--majara-charcoal)' }}
          onClick={() => void handleVote('DOWN')}
        >
          <ThumbsDown size={13} weight={vote === 'DOWN' ? 'fill' : 'regular'} />
          مفید نبود
        </button>
      </div>
    </article>
  );
}

function ExcerptCard({ excerpt }: { excerpt: CatalogExcerpt }) {
  return (
    <blockquote className="majara-excerpt-card">
      <p className="text-justify text-[13px] leading-7">{excerpt.quote}</p>
      <footer className="mt-3 text-center text-[12px] font-bold">{excerpt.author ?? excerpt.source}</footer>
      <span className="majara-excerpt-avatar" aria-hidden>
        <Smiley size={20} weight="fill" />
      </span>
    </blockquote>
  );
}

function SlideRail({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="majara-slide-rail no-scrollbar" aria-label={label}>
      {children}
    </div>
  );
}

async function shareIssue(issue: CatalogIssue, asGift: boolean) {
  const url = typeof window === 'undefined' ? '' : window.location.href;
  const title = `فصل‌نامه ماجرا — شماره ${issue.number}`;
  const text = asGift
    ? `این شماره ماجرا را به عنوان هدیه برایت فرستادم: ${issue.title}`
    : `${issue.title} — ${issue.summary}`;
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return;
    }
    await navigator.clipboard.writeText(`${text}\n${url}`);
  } catch {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
  }
}

export function IssueDetailScreen({
  issue = LATEST_ISSUE,
  excerpts = ISSUE_EXCERPTS,
  comments = ISSUE_COMMENTS,
  busy = false,
  onBuy,
  onPreview,
  analyticsChannel = 'TELEGRAM',
}: IssueDetailScreenProps): ReactNode {
  const [saved, setSaved] = useState(false);
  const [quantityOpen, setQuantityOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [buyBusy, setBuyBusy] = useState(false);
  const [buyMessage, setBuyMessage] = useState('');
  const [liveComments, setLiveComments] = useState<CatalogComment[]>(comments);
  const [guestName, setGuestName] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [commentStars, setCommentStars] = useState('5');
  const [commentMessage, setCommentMessage] = useState('');
  const [commentBusy, setCommentBusy] = useState(false);
  const [reviewComposerOpen, setReviewComposerOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const description = issue.description ?? issue.summary;
  const discountPercent =
    issue.originalPriceRial && issue.originalPriceRial > issue.priceRial
      ? Math.round((1 - issue.priceRial / issue.originalPriceRial) * 100)
      : null;
  const canExpandDescription = description.length > 180;
  const apiUrl = typeof window === 'undefined'
    ? 'http://localhost:4000'
    : (window as Window & { __MAJARA_API_URL?: string }).__MAJARA_API_URL ?? 'http://localhost:4000';

  useEffect(() => {
    setDescriptionExpanded(false);
    trackEvent({ channel: analyticsChannel, name: 'issue_view', path: window.location.pathname, issueId: issue.id });
    void fetch(`${apiUrl}/issues/${issue.id}/comments`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('comments unavailable'))))
      .then((items: CatalogComment[]) => setLiveComments(items))
      .catch(() => undefined);
  }, [analyticsChannel, apiUrl, issue.id]);

  async function confirmPurchase() {
    if (!onBuy) return;
    setBuyBusy(true);
    setBuyMessage('');
    try {
      await onBuy(quantity);
      setQuantityOpen(false);
      setQuantity(1);
    } catch (error) {
      setBuyMessage(error instanceof Error ? error.message : 'افزودن به سبد ناموفق بود');
    } finally {
      setBuyBusy(false);
    }
  }

  return (
    <div className="majara-issue-detail majara-issue-detail--store space-y-7 pb-8">
      <div className="majara-issue-detail__cover">
        <div className="majara-issue-detail__cover-frame">
          {discountPercent ? <span className="majara-discount-badge">٪{formatFa(discountPercent)}</span> : null}
          <MagazineCover
            title={issue.title}
            issue={issue.number}
            season={issue.season}
            imageSrc={issue.coverSrc}
          />
        </div>
      </div>

      <header className="majara-issue-detail__intro">
        <h1 className="majara-issue-detail__title">{highlightFirstWord(issue.title)}</h1>
        <p className="majara-issue-detail__meta">{issue.meta}</p>
        <p className="majara-issue-detail__kicker">
          شماره {formatFa(issue.number)} · {issue.season}
        </p>
      </header>

      <div className="majara-issue-detail__rating-row">
        <div className="majara-issue-rating">
          <span className="majara-issue-rating__score">۳٫۰</span>
          <Stars count={3} />
          <span className="majara-issue-rating__count">(۵۸ امتیاز)</span>
        </div>
        <div className="majara-issue-actions" aria-label="ابزارهای مجله">
          <button
            type="button"
            className="majara-issue-icon-button"
            aria-label="اشتراک‌گذاری"
            onClick={() => {
              trackEvent({ channel: analyticsChannel, name: 'share_issue', path: window.location.pathname, issueId: issue.id });
              void shareIssue(issue, false);
            }}
          >
            <ShareIcon size={20} />
          </button>
          <button
            type="button"
            className="majara-issue-icon-button"
            aria-label="هدیه دادن"
            onClick={() => {
              trackEvent({ channel: analyticsChannel, name: 'gift_issue', path: window.location.pathname, issueId: issue.id });
              void shareIssue(issue, true);
            }}
          >
            <GiftIcon size={20} />
          </button>
          <button
            type="button"
            className={`majara-issue-icon-button ${saved ? 'majara-issue-icon-button--active' : ''}`}
            aria-label={saved ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
            aria-pressed={saved}
            onClick={() => setSaved((value) => !value)}
          >
            <BookmarkSimple size={21} weight={saved ? 'fill' : 'regular'} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => {
            trackEvent({ channel: analyticsChannel, name: 'cta_click', path: window.location.pathname, issueId: issue.id, metadata: { label: 'buy' } });
            setQuantity(1);
            setBuyMessage('');
            setQuantityOpen(true);
          }}
          disabled={busy || buyBusy}
          className="majara-issue-buy"
        >
          {busy || buyBusy ? (
            'در حال افزودن...'
          ) : (
            <>
              <span>خرید</span>
              <span className="majara-issue-buy__divider" aria-hidden>
                |
              </span>
              <span className="majara-issue-buy__prices">
                <strong>{formatToman(issue.priceRial)}</strong>
                {issue.originalPriceRial ? <del>{formatToman(issue.originalPriceRial)}</del> : null}
              </span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            trackEvent({ channel: analyticsChannel, name: 'preview_open', path: window.location.pathname, issueId: issue.id });
            onPreview?.();
          }}
          className="majara-issue-preview"
        >
          <BrandIcon name="play" size={26} />
          نمونه‌خوانی
        </button>
      </div>
      {buyMessage ? <p className="text-center text-[12px] text-[var(--majara-red)]">{buyMessage}</p> : null}

      <section className="space-y-2">
        <h2 className="majara-issue-detail__section-title">معرفی شماره</h2>
        <RedWashCopy className="text-[13px] leading-7 text-justify">
          <span className={descriptionExpanded ? '' : 'line-clamp-3'}>{description}</span>
        </RedWashCopy>
        {canExpandDescription ? (
          <button
            type="button"
            className="majara-issue-description-toggle"
            aria-expanded={descriptionExpanded}
            onClick={() => setDescriptionExpanded((expanded) => !expanded)}
          >
            {descriptionExpanded ? 'کمتر' : 'بیشتر'}
          </button>
        ) : null}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-[15px] font-bold">نظر خوانندگان</h2>
          {liveComments.length > 1 ? <span className="majara-slide-hint">برای دیدن بیشتر بکشید</span> : null}
        </div>
        <RatingPrompt
          stars={Number(commentStars)}
          composerOpen={reviewComposerOpen}
          onChoose={(stars) => setCommentStars(String(stars))}
          onWrite={() => setReviewComposerOpen(true)}
        />
        <SlideRail label="نظرهای خوانندگان؛ برای دیدن نظرهای بیشتر به طرفین بکشید">
          {liveComments.map((comment) => (
            <div key={comment.id ?? `${comment.name}-${comment.body}`} className="majara-slide-rail__item">
              <ReviewCard
                comment={comment}
                onVote={comment.id ? async (value) => {
                  const clientKey = window.localStorage.getItem('majara_comment_client') ?? (crypto.randomUUID?.() ?? `${Date.now()}-client`);
                  window.localStorage.setItem('majara_comment_client', clientKey);
                  await fetch(`${apiUrl}/comments/${comment.id}/vote`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      ...(window.localStorage.getItem('majara_token')
                        ? { Authorization: `Bearer ${window.localStorage.getItem('majara_token')}` }
                        : {}),
                    },
                    body: JSON.stringify({ value, clientKey }),
                  });
                  trackEvent({ channel: analyticsChannel, name: 'comment_vote', path: window.location.pathname, issueId: issue.id, metadata: { value } });
                } : undefined}
              />
            </div>
          ))}
        </SlideRail>
        {reviewComposerOpen ? <form
          className="mt-4 space-y-2 rounded-[var(--radius)] border border-[var(--majara-charcoal)]/12 bg-white p-4"
          onSubmit={async (event: FormEvent) => {
            event.preventDefault();
            setCommentBusy(true);
            setCommentMessage('');
            try {
              const response = await fetch(`${apiUrl}/comments`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(window.localStorage.getItem('majara_token')
                    ? { Authorization: `Bearer ${window.localStorage.getItem('majara_token')}` }
                    : {}),
                },
                body: JSON.stringify({ issueId: issue.id, guestName, body: commentBody, stars: Number(commentStars) }),
              });
              if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(Array.isArray(body.message) ? body.message.join('، ') : body.message ?? 'ارسال کامنت ناموفق بود');
              }
              setGuestName('');
              setCommentBody('');
              setCommentMessage('کامنت شما ثبت شد و پس از بررسی نمایش داده می‌شود.');
              trackEvent({ channel: analyticsChannel, name: 'comment_submit', path: window.location.pathname, issueId: issue.id });
            } catch (error) {
              setCommentMessage(error instanceof Error ? error.message : 'ارسال کامنت ناموفق بود');
            } finally {
              setCommentBusy(false);
            }
          }}
        >
          <p className="text-[13px] font-bold">نظر شما درباره این شماره</p>
          <input className="h-10 w-full rounded border border-[var(--majara-charcoal)]/15 px-3 text-[12px]" placeholder="نام نمایشی" value={guestName} onChange={(event) => setGuestName(event.target.value)} />
          <textarea className="min-h-24 w-full rounded border border-[var(--majara-charcoal)]/15 p-3 text-[12px]" placeholder="متن نظر" value={commentBody} onChange={(event) => setCommentBody(event.target.value)} required />
          <button type="submit" disabled={commentBusy} className="h-10 rounded bg-[var(--majara-red)] px-4 text-[12px] font-bold text-white disabled:opacity-50">
            {commentBusy ? 'در حال ارسال...' : 'ثبت نظر'}
          </button>
          {commentMessage ? <p className="text-[11px] text-[var(--majara-muted)]">{commentMessage}</p> : null}
        </form> : null}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-[15px] font-bold">بریده‌هایی از نشریه</h2>
          <a href="/preview" className="inline-flex items-center gap-0.5 text-[12px] font-bold text-[var(--majara-red)]">
            بیشتر ({formatFa(excerpts.length)})
            <CaretLeft size={12} weight="bold" />
          </a>
        </div>
        <SlideRail label="بریده‌هایی از نشریه؛ برای دیدن بریده‌های بیشتر به طرفین بکشید">
          {excerpts.map((excerpt) => (
            <div key={excerpt.source} className="majara-slide-rail__item">
              <ExcerptCard excerpt={excerpt} />
            </div>
          ))}
        </SlideRail>
      </section>

      <p className="text-center text-[11px] text-[var(--majara-muted)]">
        از مجموعه {CATALOG_ISSUES.length} شماره ماجرا
      </p>

      {quantityOpen ? (
        <QuantityPicker
          title={issue.title}
          priceRial={issue.priceRial}
          quantity={quantity}
          busy={busy || buyBusy}
          onChange={setQuantity}
          onCancel={() => {
            if (!busy && !buyBusy) setQuantityOpen(false);
          }}
          onConfirm={confirmPurchase}
        />
      ) : null}
    </div>
  );
}
