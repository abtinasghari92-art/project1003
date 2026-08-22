'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { AuthGate } from '@/components/auth-gate';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { OrderRow } from '@/lib/types';
import { formatDate, formatRial } from '@/lib/utils';

export default function OrdersPage() {
  return (
    <AuthGate>
      <Orders />
    </AuthGate>
  );
}

function Orders() {
  const [status, setStatus] = useState('');
  const [provider, setProvider] = useState('');
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [error, setError] = useState('');

  async function load(nextStatus = status, nextProvider = provider) {
    setError('');
    const params = new URLSearchParams();
    if (nextStatus) params.set('status', nextStatus);
    if (nextProvider) params.set('provider', nextProvider);
    const qs = params.toString();
    try {
      setRows(await api<OrderRow[]>(`/admin/orders${qs ? `?${qs}` : ''}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا');
    }
  }

  useEffect(() => {
    setError('');
    api<OrderRow[]>('/admin/orders')
      .then(setRows)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'خطا'));
  }, []);

  function onFilter(event: FormEvent) {
    event.preventDefault();
    void load(status, provider);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">سفارش‌ها</h1>
      <form className="mb-4 flex flex-wrap gap-2" onSubmit={onFilter}>
        <select
          className="h-11 border border-[var(--border)] bg-white px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
          <option value="PAID">PAID</option>
          <option value="CANCELED">CANCELED</option>
          <option value="DRAFT">DRAFT</option>
        </select>
        <select
          className="h-11 border border-[var(--border)] bg-white px-3 text-sm"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        >
          <option value="">همه درگاه‌ها</option>
          <option value="ZIBAL">ZIBAL</option>
          <option value="NOWPAYMENTS">NOWPAYMENTS</option>
        </select>
        <Button type="submit">اعمال فیلتر</Button>
      </form>
      {error ? <p className="mb-3 text-sm text-[var(--majara-red)]">{error}</p> : null}
      <Card className="overflow-x-auto p-0">
        <table className="admin-table">
          <thead>
            <tr>
              <th>شناسه</th>
              <th>مشتری</th>
              <th>وضعیت</th>
              <th>مبلغ</th>
              <th>درگاه</th>
              <th>تاریخ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link className="font-bold text-[var(--majara-red)]" href={`/orders/${row.id}`}>
                    {row.id.slice(0, 8)}
                  </Link>
                </td>
                <td>
                  {row.user && 'id' in row.user ? (
                    <Link href={`/customers/${row.user.id}`}>{row.user.phone ?? row.user.id.slice(0, 8)}</Link>
                  ) : (
                    '—'
                  )}
                </td>
                <td>{row.status}</td>
                <td>{formatRial(row.amountRial)}</td>
                <td>{row.payments?.[0]?.provider ?? '—'}</td>
                <td>{formatDate(row.createdAt)}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--majara-muted)]">
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
