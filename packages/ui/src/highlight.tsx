import type { ReactNode } from 'react';

export function Highlight({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={className ? `majara-hl ${className}` : 'majara-hl'}>{children}</span>;
}

/** Body copy on paper: solid red bar, white text. */
export function RedWashCopy({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const base = 'majara-red-wash overflow-hidden px-3 py-2.5 text-[12px] leading-6 text-white';
  return <p className={className ? `${base} ${className}` : base}>{children}</p>;
}

/** Marker-box the first word; the rest of the heading stays as surrounding ink. */
export function highlightFirstWord(text: string): ReactNode {
  const trimmed = text.trim();
  const space = trimmed.search(/\s/);
  if (space === -1) return <Highlight>{trimmed}</Highlight>;
  return (
    <>
      <Highlight>{trimmed.slice(0, space)}</Highlight>
      {trimmed.slice(space)}
    </>
  );
}
