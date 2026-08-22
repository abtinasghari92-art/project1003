'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CartDto } from '@majara/types';
import { AppShell } from '@/components/shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatRial } from '@/lib/utils';

export default function CartPage() {
  const [cart, setCart] = useState<CartDto | null>(null);

  const refresh = () => api<CartDto>('/cart').then(setCart).catch(() => setCart(null));

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <AppShell>
      <h1 className="mb-4 font-[family-name:var(--font-display)] text-2xl">سبد خرید</h1>
      <div className="space-y-3">
        {cart?.items.map((item) => (
          <Card key={item.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-bold">{item.title}</p>
              <p className="text-sm">{formatRial(item.priceRial)}</p>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                await api(`/cart/items/${item.issueId}`, { method: 'DELETE' });
                await refresh();
              }}
            >
              حذف
            </Button>
          </Card>
        ))}
        {!cart?.items.length ? (
          <p className="text-sm text-[var(--majara-muted)]">سبد خالی است.</p>
        ) : null}
      </div>
      {cart ? (
        <p className="mt-4 font-bold">جمع: {formatRial(cart.totalRial)}</p>
      ) : null}
      <Link href="/checkout">
        <Button size="lg" className="mt-6">
          تسویه حساب
        </Button>
      </Link>
    </AppShell>
  );
}
