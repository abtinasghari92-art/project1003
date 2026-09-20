'use client';

import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type TouchEvent } from 'react';
import type { AnalyticsChannel } from './analytics';
import { CloseIcon } from './icons';
import { IssueDetailScreen } from './issue-detail';
import type { CatalogIssue } from './catalog';

const SWIPE_THRESHOLD = 52;

export interface IssueDetailModalProps {
  issues: CatalogIssue[];
  initialIssueId: string;
  onClose: () => void;
  onAddToCart?: (id: string, quantity: number) => void | Promise<void>;
  onPreview?: () => void;
  analyticsChannel?: AnalyticsChannel;
}

export function IssueDetailModal({
  issues,
  initialIssueId,
  onClose,
  onAddToCart,
  onPreview,
  analyticsChannel = 'TELEGRAM',
}: IssueDetailModalProps) {
  const initialIndex = useMemo(
    () => Math.max(0, issues.findIndex((issue) => issue.id === initialIssueId)),
    [initialIssueId, issues],
  );
  const [index, setIndex] = useState(initialIndex);
  const [direction, setDirection] = useState<'next' | 'previous'>('next');
  const [scrollProgress, setScrollProgress] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const issue = issues[index] ?? issues[0];
  const previousIssue = issues[index - 1];
  const nextIssue = issues[index + 1];

  useEffect(() => {
    setIndex(initialIndex);
    setScrollProgress(0);
  }, [initialIndex]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose]);

  function goTo(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= issues.length || nextIndex === index) return;
    setDirection(nextIndex > index ? 'next' : 'previous');
    setIndex(nextIndex);
    setScrollProgress(0);
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < SWIPE_THRESHOLD) return;
    goTo(distance < 0 ? index + 1 : index - 1);
  }

  if (!issue) return null;

  return (
    <div className="majara-issue-modal" role="dialog" aria-modal="true" aria-label={`جزئیات ${issue.title}`}>
      <div className="majara-issue-modal__backdrop" onClick={onClose} aria-hidden />
      <div className="majara-issue-modal__frame">
        {previousIssue ? <div className="majara-issue-modal__peek majara-issue-modal__peek--previous" aria-hidden /> : null}
        {nextIssue ? <div className="majara-issue-modal__peek majara-issue-modal__peek--next" aria-hidden /> : null}
        <button type="button" className="majara-issue-modal__close" onClick={onClose} aria-label="بستن جزئیات شماره">
          <CloseIcon size={20} />
        </button>

        <article
          key={issue.id}
          className="majara-issue-modal__page"
          data-direction={direction}
          style={{ '--majara-issue-scroll': scrollProgress } as CSSProperties}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onScroll={(event) => setScrollProgress(Math.min(event.currentTarget.scrollTop / 260, 1))}
        >
          <IssueDetailScreen
            issue={issue}
            analyticsChannel={analyticsChannel}
            onBuy={(quantity) => onAddToCart?.(issue.id, quantity)}
            onPreview={onPreview ?? (() => window.location.assign('/preview'))}
          />
        </article>

        <div className="majara-issue-modal__pager" aria-label="جابجایی شماره‌ها">
          <button type="button" onClick={() => goTo(index - 1)} disabled={!previousIssue} aria-label="شماره قبلی">
            <CaretRight size={18} weight="bold" />
          </button>
          <span>{index + 1} از {issues.length}</span>
          <button type="button" onClick={() => goTo(index + 1)} disabled={!nextIssue} aria-label="شماره بعدی">
            <CaretLeft size={18} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
