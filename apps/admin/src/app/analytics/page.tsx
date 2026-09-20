'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { AuthGate } from '@/components/auth-gate';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api, getToken } from '@/lib/api';
import type { AnalyticsOverview } from '@/lib/types';
import { formatRial } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const nf = new Intl.NumberFormat('fa-IR-u-nu-latn');
const labels: Record<string, string> = { issue_view: 'مشاهده شماره', page_view: 'مشاهده صفحه', add_to_cart: 'افزودن به سبد', preview_open: 'بازکردن پیش‌نمایش', checkout_start: 'شروع پرداخت', purchase_success: 'خرید موفق', share_issue: 'اشتراک‌گذاری', gift_issue: 'هدیه', comment_submit: 'ارسال کامنت', comment_vote: 'رأی کامنت', cta_click: 'کلیک CTA' };

export default function AnalyticsPage() {
  return <AuthGate><Analytics /></AuthGate>;
}

function Analytics() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [days, setDays] = useState('30');
  const [channel, setChannel] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async (nextDays = days, nextChannel = channel) => {
    const to = new Date();
    const from = new Date(to.getTime() - Number(nextDays) * 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
    if (nextChannel) params.set('channel', nextChannel);
    try { setData(await api<AnalyticsOverview>(`/admin/analytics/overview?${params}`)); setError(''); }
    catch (err) { setError(err instanceof Error ? err.message : 'خطا در دریافت آمار'); }
  }, [channel, days]);

  useEffect(() => { void load(); }, [load]);

  function submit(event: FormEvent) { event.preventDefault(); void load(); }

  async function exportCsv() {
    if (!data) return;
    const response = await fetch(`${API_URL}/admin/analytics/export.csv?from=${encodeURIComponent(data.from)}&to=${encodeURIComponent(data.to)}${channel ? `&channel=${channel}` : ''}`, { headers: { Authorization: `Bearer ${getToken() ?? ''}` } });
    if (!response.ok) { setError('دانلود گزارش ناموفق بود'); return; }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'majara-report.csv'; link.click(); URL.revokeObjectURL(url);
  }

  async function saveSnapshot() {
    if (!data) return;
    const response = await api('/admin/reports/snapshots', { method: 'POST', body: JSON.stringify({}) });
    setNotice(response ? 'گزارش در تاریخچه ذخیره شد.' : '');
  }

  return <div className="space-y-6 print:bg-white">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm text-[var(--majara-muted)]">داده‌های first-party از دو مینی‌اپ</p><h1 className="mt-1 text-2xl font-bold">تحلیل و آمار</h1></div>
      <form className="flex flex-wrap gap-2 print:hidden" onSubmit={submit}>
        <select className="h-10 border border-[var(--border)] bg-white px-3 text-sm" value={days} onChange={(event) => setDays(event.target.value)}><option value="7">۷ روز</option><option value="30">۳۰ روز</option><option value="90">۹۰ روز</option></select>
        <select className="h-10 border border-[var(--border)] bg-white px-3 text-sm" value={channel} onChange={(event) => setChannel(event.target.value)}><option value="">همه کانال‌ها</option><option value="TELEGRAM">Telegram</option><option value="BALE">Bale</option></select>
        <Button type="submit">اعمال</Button><Button type="button" variant="outline" onClick={() => void exportCsv()}>CSV</Button><Button type="button" variant="outline" onClick={() => window.print()}>PDF / چاپ</Button><Button type="button" variant="muted" onClick={() => void saveSnapshot()}>ذخیره گزارش</Button>
      </form>
    </div>
    {error ? <p className="text-sm text-[var(--majara-red)]">{error}</p> : null}{notice ? <p className="text-sm text-[#2a9d8f]">{notice}</p> : null}
    {data ? <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Kpi label="رویدادها" value={nf.format(data.events)} /><Kpi label="نشست‌ها" value={nf.format(data.sessions)} /><Kpi label="کاربران" value={nf.format(data.users)} /><Kpi label="درآمد" value={formatRial(data.revenueRial)} /></div>
      <div className="grid gap-4 lg:grid-cols-2"><Card><h2 className="mb-4 font-bold">رویدادهای محصول</h2>{data.eventBreakdown.map((item) => <div key={item.name} className="mb-3 flex items-center gap-3"><span className="w-40 text-sm">{labels[item.name] ?? item.name}</span><div className="h-2 flex-1 rounded bg-[var(--majara-paper-2)]"><div className="h-2 rounded bg-[var(--majara-red)]" style={{ width: `${Math.min(100, item.count / Math.max(1, data.events) * 100 * 3)}%` }} /></div><strong className="w-12 text-left text-sm">{nf.format(item.count)}</strong></div>)}</Card>
        <Card><h2 className="mb-4 font-bold">تفکیک کانال</h2>{data.channels.map((item) => <div key={item.channel} className="mb-4 flex items-center justify-between rounded border border-[var(--border)] p-3"><span>{item.channel === 'TELEGRAM' ? 'Telegram' : 'Bale'}</span><strong>{nf.format(item.events)} رویداد</strong></div>)}<div className="mt-6 border-t border-[var(--border)] pt-4"><h3 className="mb-3 text-sm font-bold">نرخ‌های تبدیل</h3><div className="grid grid-cols-3 gap-2 text-center text-xs"><Rate label="مشاهده → سبد" value={data.conversion.viewToCart} /><Rate label="سبد → پرداخت" value={data.conversion.cartToCheckout} /><Rate label="پرداخت → خرید" value={data.conversion.checkoutToPurchase} /></div></div></Card></div>
      <Card><h2 className="mb-4 font-bold">روند روزانه</h2><div className="overflow-x-auto"><table className="admin-table"><thead><tr><th>تاریخ</th><th>مشاهده</th><th>سبد</th><th>خرید</th></tr></thead><tbody>{data.timeline.map((item) => <tr key={item.date}><td>{new Date(item.date).toLocaleDateString('fa-IR-u-nu-latn')}</td><td>{nf.format(item.views)}</td><td>{nf.format(item.carts)}</td><td>{nf.format(item.purchases)}</td></tr>)}</tbody></table></div></Card>
    </> : <Card>در حال دریافت آمار...</Card>}
  </div>;
}

function Kpi({ label, value }: { label: string; value: string }) { return <Card><p className="text-sm text-[var(--majara-muted)]">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></Card>; }
function Rate({ label, value }: { label: string; value: number }) { return <div className="rounded bg-[var(--majara-paper-2)] p-3"><p className="text-[10px] text-[var(--majara-muted)]">{label}</p><strong className="mt-1 block text-lg">{(value * 100).toFixed(1)}٪</strong></div>; }
