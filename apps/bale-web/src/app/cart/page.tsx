'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CartDto } from '@majara/types';
import { notifyCartChanged } from '@majara/ui';
import { AppShell } from '@/components/shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatRial } from '@/lib/utils';

export default function CartPage() {
  const [cart, setCart] = useState<CartDto | null>(null);
  const [error, setError] = useState('');
  const [updatingIssueId, setUpdatingIssueId] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setCart(await api<CartDto>('/cart'));
      setError('');
    } catch (error) {
      setCart(null);
      setError(error instanceof Error ? error.message : 'دریافت سبد خرید ناموفق بود');
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  async function updateQuantity(issueId: string, qty: number) {
    if (qty < 1) return;
    setUpdatingIssueId(issueId);
    try {
      const nextCart = await api<CartDto>('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ issueId, qty }),
      });
      setCart(nextCart);
      setError('');
      notifyCartChanged();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'تغییر تعداد ناموفق بود');
    } finally {
      setUpdatingIssueId(null);
    }
  }

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-bold">سبد خرید</h1>
      <div className="space-y-3">
        {cart?.items.map((item) => (
          <Card key={item.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-bold">{item.title}</p>
              <p className="text-[12px] text-[var(--majara-muted)]">شماره {item.number}</p>
              <div className="mt-2 flex items-center gap-2" aria-label={`تعداد ${item.title}`}>
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-full border border-[var(--majara-charcoal)]/20 text-lg font-bold disabled:opacity-40"
                  onClick={() => void updateQuantity(item.issueId, item.qty - 1)}
                  disabled={item.qty <= 1 || updatingIssueId === item.issueId}
                  aria-label="کم کردن تعداد"
                >
                  −
                </button>
                <span className="min-w-7 text-center text-sm font-bold">{item.qty}</span>
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-full bg-[var(--majara-red)] text-lg font-bold text-white disabled:opacity-40"
                  onClick={() => void updateQuantity(item.issueId, item.qty + 1)}
                  disabled={updatingIssueId === item.issueId}
                  aria-label="زیاد کردن تعداد"
                >
                  +
                </button>
              </div>
              <p className="majara-price mt-2 text-sm">{formatRial(item.priceRial * item.qty)}</p>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  setUpdatingIssueId(item.issueId);
                  const nextCart = await api<CartDto>(`/cart/items/${item.issueId}`, { method: 'DELETE' });
                  setCart(nextCart);
                  notifyCartChanged();
                } catch (error) {
                  setError(error instanceof Error ? error.message : 'حذف از سبد ناموفق بود');
                } finally {
                  setUpdatingIssueId(null);
                }
              }}
              disabled={updatingIssueId === item.issueId}
            >
              {updatingIssueId === item.issueId ? '...' : 'حذف'}
            </Button>
          </Card>
        ))}
        {!cart?.items.length ? (
          <p className="majara-panel px-4 py-8 text-center text-sm text-[var(--majara-muted)]">
            سبد خالی است.
          </p>
        ) : null}
      </div>
      {cart ? (
        <p className="mt-4 text-lg font-bold">جمع: {formatRial(cart.totalRial)}</p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-[var(--majara-red)]">{error}</p> : null}
      {cart?.items.length ? (
        <Link href="/checkout">
          <Button size="lg" className="mt-6">
            تسویه حساب
          </Button>
        </Link>
      ) : (
        <Button size="lg" className="mt-6" disabled>
          تسویه حساب
        </Button>
      )}
    </AppShell>
  );
}
