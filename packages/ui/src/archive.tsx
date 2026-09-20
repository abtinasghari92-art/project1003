'use client';

import { useMemo, useState } from 'react';
import { CATALOG_ISSUES, type CatalogIssue } from './catalog';
import { CatalogSearch } from './catalog-search';
import { MagazineCover } from './cover';
import { Highlight } from './highlight';
import { IssueCaption } from './issue-caption';
import { IssueDetailModal } from './issue-detail-modal';

export function ArchiveScreen({
  issues = CATALOG_ISSUES,
  onAddToCart,
  analyticsChannel = 'TELEGRAM',
}: {
  issues?: CatalogIssue[];
  onAddToCart?: (id: string, quantity: number) => void | Promise<void>;
  analyticsChannel?: 'TELEGRAM' | 'BALE';
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const categories = useMemo(() => {
    const seasons = [...new Set(issues.map((issue) => issue.season).filter(Boolean))];
    return [{ id: 'all', label: 'همه' }, ...seasons.map((season) => ({ id: season, label: season }))];
  }, [issues]);
  const visible = useMemo(
    () =>
      issues.filter((issue) => {
        const matchesQuery =
          !query.trim() ||
          `${issue.title} ${issue.season} شماره ${issue.number}`.includes(query.trim());
        const matchesCategory = category === 'all' || issue.season === category;
        return matchesQuery && matchesCategory;
      }),
    [issues, query, category],
  );

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">
        <Highlight>آرشیو</Highlight>
      </h1>
      <div className="mb-4">
        <CatalogSearch
          query={query}
          onQueryChange={setQuery}
          placeholder="جستجو در شماره‌ها"
          categories={categories}
          categoryId={category}
          onCategoryChange={setCategory}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {visible.map((issue) => (
          <button key={issue.id} type="button" onClick={() => setActiveIssueId(issue.id)} className="block text-right">
            <div className="relative">
              <MagazineCover
                title={issue.title}
                issue={issue.number}
                season={issue.season}
                imageSrc={issue.coverSrc}
              />
              <span className="absolute top-2 right-2 grid h-6 min-w-6 place-items-center rounded-md bg-[var(--majara-red)] px-1 text-[11px] font-bold text-white">
                {issue.number}
              </span>
            </div>
            <IssueCaption
              title={issue.title}
              number={issue.number}
              season={issue.season}
              priceRial={issue.priceRial}
            />
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--majara-muted)]">شماره‌ای پیدا نشد.</p>
      ) : null}
      {activeIssueId ? (
        <IssueDetailModal
          issues={issues}
          initialIssueId={activeIssueId}
          onClose={() => setActiveIssueId(null)}
          onAddToCart={onAddToCart}
          analyticsChannel={analyticsChannel}
        />
      ) : null}
    </div>
  );
}
