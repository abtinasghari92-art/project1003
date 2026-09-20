'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { AuthGate } from '@/components/auth-gate';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { AnalyticsOverview } from '@/lib/types';
import { formatRial } from '@/lib/utils';

const number = new Intl.NumberFormat('fa-IR-u-nu-latn');

export default function DashboardPage() {
  return <AuthGate><Dashboard /></AuthGate>;
}

function Dashboard() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [channel, setChannel] = useState('');
  const [days, setDays] = useState('30');
  const [error, setError] = useState('');

  const load = useCallback(async (nextDays = days, nextChannel = channel) => {
    const to = new Date();
    const from = new Date(to.getTime() - Number(nextDays) * 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
    if (nextChannel) params.set('channel', nextChannel);
    try {
      setError('');
      setData(await api<AnalyticsOverview>(`/admin/analytics/overview?${params.toString()}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت آمار');
    }
  }, [channel, days]);

  useEffect(() => { void load(); }, [load]);

  function submit(event: FormEvent) {
    event.preventDefault();
    void load(days, channel);
  }

  const cards = data ? [
    { label: 'کاربران یکتا', value: number.format(data.users) },
    { label: 'نشست‌ها', value: number.format(data.sessions) },
    { label: 'سفارش پرداخت‌شده', value: number.format(data.paidOrders) },
    { label: 'درآمد', value: formatRial(data.revenueRial) },
    { label: 'کامنت در انتظار', value: number.format(data.pendingComments), href: '/comments?status=PENDING' },
  ] : [];
  const max = Math.max(1, ...(data?.timeline.map((item) => Math.max(item.views, item.carts, item.purchases)) ?? []));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm text-[var(--majara-muted)]">نمای کلی عملکرد فروشگاه</p><h1 className="mt-1 text-2xl font-bold">داشبورد مدیریتی</h1></div>
        <form className="flex flex-wrap gap-2" onSubmit={submit}>
          <select className="h-10 border border-[var(--border)] bg-white px-3 text-sm" value={days} onChange={(event) => setDays(event.target.value)}>
            <option value="7">۷ روز اخیر</option><option value="30">۳۰ روز اخیر</option><option value="90">۹۰ روز اخیر</option>
          </select>
          <select className="h-10 border border-[var(--border)] bg-white px-3 text-sm" value={channel} onChange={(event) => setChannel(event.target.value)}>
            <option value="">همه کانال‌ها</option><option value="TELEGRAM">Telegram</option><option value="BALE">Bale</option>
          </select>
          <Button type="submit">به‌روزرسانی</Button>
        </form>
      </div>
      {error ? <p className="text-sm text-[var(--majara-red)]">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => card.href ? <Link key={card.label} href={card.href}><MetricCard label={card.label} value={card.value} /></Link> : <MetricCard key={card.label} label={card.label} value={card.value} />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">روند تعامل و خرید</h2><Link href="/analytics" className="text-xs text-[var(--majara-red)]">جزئیات آمار ←</Link></div>
          <div className="flex h-56 items-end gap-1 overflow-hidden border-b border-[var(--border)] px-1 pb-1">
            {(data?.timeline ?? []).map((item) => <div key={item.date} className="flex min-w-5 flex-1 items-end justify-center gap-0.5" title={item.date}>
              <span className="w-1.5 rounded-t bg-[var(--majara-red)]" style={{ height: `${Math.max(3, item.views / max * 100)}%` }} />
              <span className="w-1.5 rounded-t bg-[#d9a441]" style={{ height: `${Math.max(3, item.carts / max * 100)}%` }} />
              <span className="w-1.5 rounded-t bg-[#2a9d8f]" style={{ height: `${Math.max(3, item.purchases / max * 100)}%` }} />
            </div>)}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--majara-muted)]"><span><i className="legend-dot bg-[var(--majara-red)]" /> مشاهده</span><span><i className="legend-dot bg-[#d9a441]" /> سبد</span><span><i className="legend-dot bg-[#2a9d8f]" /> خرید</span></div>
        </Card>
        <Card>
          <h2 className="mb-4 font-bold">قیف تبدیل</h2>
          <Funnel label="مشاهده شماره" value={data?.conversion.views ?? 0} total={data?.conversion.views ?? 1} />
          <Funnel label="افزودن به سبد" value={data?.conversion.carts ?? 0} total={data?.conversion.views ?? 1} />
          <Funnel label="شروع پرداخت" value={data?.conversion.checkouts ?? 0} total={data?.conversion.views ?? 1} />
          <Funnel label="خرید موفق" value={data?.conversion.purchases ?? 0} total={data?.conversion.views ?? 1} />
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return <Card className="transition hover:-translate-y-0.5 hover:shadow-md"><p className="text-sm text-[var(--majara-muted)]">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></Card>;
}

function Funnel({ label, value, total }: { label: string; value: number; total: number }) {
  const percent = total ? Math.min(100, (value / total) * 100) : 0;
  return <div className="mb-4"><div className="mb-1 flex justify-between text-sm"><span>{label}</span><strong>{number.format(value)}</strong></div><div className="h-2 rounded bg-[var(--majara-paper-2)]"><div className="h-2 rounded bg-[var(--majara-red)]" style={{ width: `${percent}%` }} /></div></div>;
}
