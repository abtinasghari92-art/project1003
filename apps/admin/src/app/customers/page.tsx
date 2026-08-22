'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { AuthGate } from '@/components/auth-gate';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import type { CustomerRow } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function CustomersPage() {
  return (
    <AuthGate>
      <Customers />
    </AuthGate>
  );
}

function Customers() {
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [error, setError] = useState('');

  async function load(q = '') {
    setError('');
    try {
      const path = q ? `/admin/customers?q=${encodeURIComponent(q)}` : '/admin/customers';
      setRows(await api<CustomerRow[]>(path));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا');
    }
  }

  useEffect(() => {
    void load();
    // Initial list only; search is submitted from the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    void load(query);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">مشتریان</h1>
      <form className="mb-4 flex max-w-xl gap-2" onSubmit={onSearch}>
        <Input
          placeholder="جستجو: موبایل یا یوزرنیم تلگرام/بله"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit">جستجو</Button>
      </form>
      {error ? <p className="mb-3 text-sm text-[var(--majara-red)]">{error}</p> : null}
      <Card className="overflow-x-auto p-0">
        <table className="admin-table">
          <thead>
            <tr>
              <th>موبایل</th>
              <th>تلگرام</th>
              <th>بله</th>
              <th>سفارش</th>
              <th>نوت</th>
              <th>ثبت</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link className="font-bold text-[var(--majara-red)]" href={`/customers/${row.id}`}>
                    {row.phone ?? '—'}
                  </Link>
                </td>
                <td>{row.telegram?.username ? `@${row.telegram.username}` : '—'}</td>
                <td>{row.bale?.username ? `@${row.bale.username}` : '—'}</td>
                <td>{row.ordersCount}</td>
                <td>{row.notesCount}</td>
                <td>{formatDate(row.createdAt)}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--majara-muted)]">
                  مشتری‌ای پیدا نشد
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
