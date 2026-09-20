'use client';

import { useEffect, useState } from 'react';
import { AuthGate } from '@/components/auth-gate';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { ReportSnapshot } from '@/lib/types';
import { formatDate, formatRial } from '@/lib/utils';

export default function ReportsPage() { return <AuthGate><Reports /></AuthGate>; }

function Reports() {
  const [rows, setRows] = useState<ReportSnapshot[]>([]);
  const [error, setError] = useState('');
  async function load() { try { setRows(await api<ReportSnapshot[]>('/admin/reports/snapshots')); } catch (err) { setError(err instanceof Error ? err.message : 'خطا'); } }
  useEffect(() => { void load(); }, []);
  return <div className="space-y-6"><div><p className="text-sm text-[var(--majara-muted)]">نسخه‌های ذخیره‌شده برای مرور مدیریتی</p><h1 className="mt-1 text-2xl font-bold">گزارش‌ها</h1></div>{error ? <p className="text-sm text-[var(--majara-red)]">{error}</p> : null}<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{rows.map((row) => <Card key={row.id}><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-[var(--majara-muted)]">{row.periodType} · {row.channel ?? 'همه کانال‌ها'}</p><h2 className="mt-1 font-bold">{formatDate(row.createdAt)}</h2></div><Button size="sm" variant="outline" onClick={() => window.print()}>PDF</Button></div><div className="mt-4 grid grid-cols-2 gap-2 text-sm"><p>کاربر: <strong>{new Intl.NumberFormat('fa-IR-u-nu-latn').format(row.summary.users)}</strong></p><p>سفارش: <strong>{new Intl.NumberFormat('fa-IR-u-nu-latn').format(row.summary.paidOrders)}</strong></p><p>درآمد: <strong>{formatRial(row.summary.revenueRial)}</strong></p><p>رویداد: <strong>{new Intl.NumberFormat('fa-IR-u-nu-latn').format(row.summary.events)}</strong></p></div><p className="mt-3 text-xs text-[var(--majara-muted)]">{formatDate(row.from)} تا {formatDate(row.to)}</p></Card>)}{!rows.length ? <Card>هنوز گزارشی ذخیره نشده؛ از صفحه تحلیل و آمار یک گزارش بسازید.</Card> : null}</div></div>;
}
