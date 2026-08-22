'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { AuthGate } from '@/components/auth-gate';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { OrderItemRow, PaymentRow } from '@/lib/types';
import { formatDate, formatRial } from '@/lib/utils';

type OrderDetail = {
  id: string;
  status: string;
  amountRial: number;
  amountUsd: string | null;
  shippingRial: number;
  firstName: string | null;
  lastName: string | null;
  province: string | null;
  city: string | null;
  street: string | null;
  postalCode: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
  user: {
    id: string;
    phone: string | null;
    telegram: { username: string | null } | null;
    bale: { username: string | null } | null;
  };
  items: OrderItemRow[];
  payments: PaymentRow[];
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGate>
      <OrderDetail id={id} />
    </AuthGate>
  );
}

function OrderDetail({ id }: { id: string }) {
  const [data, setData] = useState<OrderDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<OrderDetail>(`/admin/orders/${id}`)
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'خطا'));
  }, [id]);

  if (!data && !error) return <p className="text-sm text-[var(--majara-muted)]">در حال بارگذاری...</p>;
  if (!data) return <p className="text-sm text-[var(--majara-red)]">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/orders" className="text-sm text-[var(--majara-muted)]">
          ← سفارش‌ها
        </Link>
        <h1 className="mt-2 text-2xl font-bold">سفارش {data.id.slice(0, 8)}</h1>
        <p className="text-sm text-[var(--majara-muted)]">
          {data.status} · {formatRial(data.amountRial)} · {formatDate(data.createdAt)}
        </p>
      </div>

      <Card>
        <h2 className="mb-2 font-bold">مشتری</h2>
        <Link className="text-[var(--majara-red)]" href={`/customers/${data.user.id}`}>
          {data.user.phone ?? data.user.id}
        </Link>
        <p className="mt-1 text-sm text-[var(--majara-muted)]">
          تلگرام: {data.user.telegram?.username ? `@${data.user.telegram.username}` : '—'} · بله:{' '}
          {data.user.bale?.username ? `@${data.user.bale.username}` : '—'}
        </p>
      </Card>

      <Card>
        <h2 className="mb-2 font-bold">صورت حساب و حمل و نقل</h2>
        {data.firstName || data.street ? (
          <ul className="space-y-1 text-sm">
            <li>
              {[data.firstName, data.lastName].filter(Boolean).join(' ') || '—'}
            </li>
            <li>
              {[data.province, data.city].filter(Boolean).join('، ') || '—'}
            </li>
            <li>{data.street || '—'}</li>
            <li>کدپستی: {data.postalCode || '—'}</li>
            <li>تلفن: {data.phone || '—'}</li>
            {data.notes ? <li>یادداشت: {data.notes}</li> : null}
            <li>بسته‌بندی و ارسال: {formatRial(data.shippingRial ?? 0)}</li>
          </ul>
        ) : (
          <p className="text-sm text-[var(--majara-muted)]">آدرسی ثبت نشده</p>
        )}
      </Card>

      <Card className="overflow-x-auto p-0">
        <h2 className="p-4 font-bold">اقلام</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>عنوان</th>
              <th>تعداد</th>
              <th>قیمت</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.qty}</td>
                <td>{formatRial(item.priceRial)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="overflow-x-auto p-0">
        <h2 className="p-4 font-bold">پرداخت‌ها</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>درگاه</th>
              <th>وضعیت</th>
              <th>مبلغ</th>
              <th>شناسه خارجی</th>
              <th>تاریخ</th>
            </tr>
          </thead>
          <tbody>
            {data.payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.provider}</td>
                <td>{payment.status}</td>
                <td>{formatRial(payment.amountRial)}</td>
                <td>{payment.externalId ?? '—'}</td>
                <td>{formatDate(payment.createdAt)}</td>
              </tr>
            ))}
            {data.payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-[var(--majara-muted)]">
                  پرداختی نیست
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
