'use client';

import { GridIcon, SearchIcon } from './icons';

export interface CatalogSearchCategory {
  id: string;
  label: string;
}

export function CatalogChips({
  categories,
  categoryId,
  onCategoryChange,
  leading = false,
}: {
  categories: CatalogSearchCategory[];
  categoryId: string;
  onCategoryChange: (id: string) => void;
  leading?: boolean;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
      {leading ? (
        <button type="button" className="majara-chip majara-chip-menu" onClick={() => onCategoryChange('all')}>
          <GridIcon size={14} />
          دسته‌بندی
        </button>
      ) : null}
      {categories.map((item) => {
        const active = item.id === categoryId;
        return (
          <button
            key={item.id}
            type="button"
            className={active ? 'majara-chip majara-chip-active' : 'majara-chip'}
            onClick={() => onCategoryChange(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function CatalogSearch({
  query,
  onQueryChange,
  placeholder,
  categories,
  categoryId,
  onCategoryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  categories?: CatalogSearchCategory[];
  categoryId?: string;
  onCategoryChange?: (id: string) => void;
}) {
  const hasChips = Boolean(categories?.length && categoryId != null && onCategoryChange);

  return (
    <div className="space-y-3">
      <label className="majara-search flex h-11 min-w-0 items-center gap-2 rounded-[var(--radius-lg)] px-3">
        <SearchIcon size={16} className="shrink-0" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="h-full w-full appearance-none border-0 bg-transparent text-sm outline-none"
          placeholder={placeholder}
          aria-label="جستجو"
        />
      </label>

      {hasChips ? (
        <CatalogChips
          categories={categories ?? []}
          categoryId={categoryId ?? 'all'}
          onCategoryChange={onCategoryChange!}
        />
      ) : null}
    </div>
  );
}
