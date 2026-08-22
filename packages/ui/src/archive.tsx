'use client';

import { MagazineCover } from './cover';

const ISSUES = [
  { number: 3, title: 'میراث از دست رفته', season: 'زمستان ۱۴۰۳' },
  { number: 2, title: 'عملیات در اروپا', season: 'پاییز ۱۴۰۳' },
  { number: 1, title: 'شماره اول', season: 'تابستان ۱۴۰۳' },
];

export function ArchiveScreen() {
  return (
    <div>
      <h1 className="mb-4 font-[family-name:var(--font-display)] text-2xl">آرشیو</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className="h-10 min-w-[140px] flex-1 border border-[var(--majara-line)] bg-white px-3 text-sm outline-none"
          placeholder="جستجو"
        />
        {['سال', 'فصل', 'موضوع'].map((label) => (
          <button
            key={label}
            type="button"
            className="h-10 border border-[var(--majara-line)] bg-white px-3 text-xs"
          >
            {label} ▾
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ISSUES.map((issue) => (
          <article key={issue.number}>
            <div className="relative">
              <MagazineCover title={issue.title} issue={issue.number} season={issue.season} />
              <span className="absolute top-2 right-2 grid h-6 w-6 place-items-center rounded-full bg-[var(--majara-red)] text-[11px] font-bold text-white">
                {issue.number}
              </span>
            </div>
            <p className="mt-2 text-sm font-bold">{issue.title}</p>
            <p className="text-[11px] text-[var(--majara-muted)]">
              شماره {issue.number} | {issue.season}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
