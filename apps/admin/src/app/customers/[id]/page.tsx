'use client';

import Link from 'next/link';
import { FormEvent, use, useCallback, useEffect, useState } from 'react';
import { AuthGate } from '@/components/auth-gate';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { api } from '@/lib/api';
import type { CustomerNote, OrderRow } from '@/lib/types';
import { formatDate, formatRial } from '@/lib/utils';

type CustomerDetail = {
  id: string;
  phone: string | null;
  createdAt: string;
  telegram: { telegramId: string; username: string | null; firstName: string | null; lastName: string | null } | null;
  bale: { baleId: string; username: string | null; firstName: string | null; lastName: string | null } | null;
  orders: OrderRow[];
  notes: CustomerNote[];
};

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGate>
      <CustomerDetail id={id} />
    </AuthGate>
  );
}

function CustomerDetail({ id }: { id: string }) {
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setData(await api<CustomerDetail>(`/admin/customers/${id}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا');
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onNote(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    try {
      await api(`/admin/customers/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
      setBody('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا');
    }
  }

  if (!data && !error) return <p className="text-sm text-[var(--majara-muted)]">در حال بارگذاری...</p>;
  if (!data) return <p className="text-sm text-[var(--majara-red)]">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/customers" className="text-sm text-[var(--majara-muted)]">
          ← مشتریان
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{data.phone ?? 'مشتری بدون موبایل'}</h1>
        <p className="text-sm text-[var(--majara-muted)]">ثبت {formatDate(data.createdAt)}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-2 font-bold">تلگرام</h2>
          {data.telegram ? (
            <ul className="space-y-1 text-sm">
              <li>آیدی: {data.telegram.telegramId}</li>
              <li>یوزرنیم: {data.telegram.username ? `@${data.telegram.username}` : '—'}</li>
              <li>
                نام: {[data.telegram.firstName, data.telegram.lastName].filter(Boolean).join(' ') || '—'}
              </li>
            </ul>
          ) : (
            <p className="text-sm text-[var(--majara-muted)]">متصل نیست</p>
          )}
        </Card>
        <Card>
          <h2 className="mb-2 font-bold">بله</h2>
          {data.bale ? (
            <ul className="space-y-1 text-sm">
              <li>آیدی: {data.bale.baleId}</li>
              <li>یوزرنیم: {data.bale.username ? `@${data.bale.username}` : '—'}</li>
              <li>نام: {[data.bale.firstName, data.bale.lastName].filter(Boolean).join(' ') || '—'}</li>
            </ul>
          ) : (
            <p className="text-sm text-[var(--majara-muted)]">متصل نیست</p>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 font-bold">نوت‌ها</h2>
        <form className="mb-4 space-y-2" onSubmit={onNote}>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="یادداشت کوتاه" />
          <Button type="submit" size="sm">
            ثبت نوت
          </Button>
        </form>
        <ul className="space-y-3">
          {data.notes.map((note) => (
            <li key={note.id} className="border-t border-[var(--border)] pt-3 text-sm">
              <p>{note.body}</p>
              <p className="mt-1 text-xs text-[var(--majara-muted)]">
                {note.admin.name} · {formatDate(note.createdAt)}
              </p>
            </li>
          ))}
          {data.notes.length === 0 ? (
            <li className="text-sm text-[var(--majara-muted)]">نوتی ثبت نشده</li>
          ) : null}
        </ul>
      </Card>

      <Card className="overflow-x-auto p-0">
        <h2 className="p-4 font-bold">سفارش‌ها</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>شناسه</th>
              <th>وضعیت</th>
              <th>مبلغ</th>
              <th>تاریخ</th>
            </tr>
          </thead>
          <tbody>
            {data.orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link className="text-[var(--majara-red)]" href={`/orders/${order.id}`}>
                    {order.id.slice(0, 8)}
                  </Link>
                </td>
                <td>{order.status}</td>
                <td>{formatRial(order.amountRial)}</td>
                <td>{formatDate(order.createdAt)}</td>
              </tr>
            ))}
            {data.orders.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-[var(--majara-muted)]">
                  سفارشی نیست
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
