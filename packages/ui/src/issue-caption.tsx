import { formatToman } from './catalog';

export function IssueCaption({
  number,
  season,
  priceRial,
  title,
}: {
  number: number;
  season: string;
  priceRial?: number;
  title?: string;
}) {
  return (
    <div className="majara-caption mt-2 px-2 py-2">
      {title ? <p className="text-[13px] font-bold leading-5">{title}</p> : null}
      <p className="text-[12px] font-bold">شماره {number}</p>
      <p className="mt-0.5 text-[11px] font-bold">{season}</p>
      {priceRial != null ? (
        <p className="majara-price mt-0.5 text-[12px]">{formatToman(priceRial)}</p>
      ) : null}
    </div>
  );
}
