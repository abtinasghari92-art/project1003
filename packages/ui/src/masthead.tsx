'use client';

export const MASTHEAD_ROWS = [
  { role: 'مدیر مسئول', names: 'محمد مهدی دادمان' },
  { role: 'جانشین مدیر مسئول', names: 'سید یزدان حبیبی' },
  {
    role: 'شورای سیاست‌گذاری',
    names: 'سجاد صفارهرندی، مسعود ملکی، محمد توکلی، مرتضی قاضی، مهدی اسلامی',
  },
  { role: 'سردبیر', names: 'جواد موگویی' },
  { role: 'جانشین سردبیر', names: 'محبوبه رحمتی' },
  {
    role: 'تحریریه',
    names:
      'مهدی حیدری، میثم میرهادی، مهدی دهرویه، علیرضا خداکرمی، محمدحسین فروغی، فاطمه کریمی، رضا یزدانی، ریحانی موگویی',
  },
] as const;

export function Masthead({ compact = false }: { compact?: boolean }) {
  return (
    <section id="shenasnameh" className="border border-[var(--majara-ink)] bg-white">
      <header className="flex items-end justify-between border-b-2 border-[var(--majara-red)] px-3 py-2">
        <div>
          <p
            className="text-2xl leading-none text-[var(--majara-red)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            ماجرا
          </p>
          <p className="mt-1 text-[10px] text-[var(--majara-muted)]">فصل‌نامه تاریخی-سیاسی</p>
        </div>
        <p className="text-[11px] font-bold">شناسنامه · شماره سوم</p>
      </header>
      <dl className={compact ? 'space-y-2 p-3' : 'space-y-3 p-4'}>
        {MASTHEAD_ROWS.map((row) => (
          <div key={row.role}>
            <dt className="text-[11px] font-bold text-[var(--majara-red)]">{row.role}</dt>
            <dd className="mt-0.5 text-[12px] leading-6">{row.names}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
