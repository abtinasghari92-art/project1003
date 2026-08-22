'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  CartDto,
  MagazineDto,
  OrderDto,
  PaymentIntentDto,
  PublicUser,
} from '@majara/types';
import { CheckoutScreen, type CheckoutSubmitPayload } from '@majara/ui';
import { AppShell } from '@/components/shell';
import { api } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [fallback, setFallback] = useState<{
    id: string;
    title: string;
    number: number;
    priceRial: number;
    qty: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void api<CartDto>('/cart').then(setCart).catch(() => setCart(null));
    void api<PublicUser>('/me').then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (cart?.items.length) return;
    void api<MagazineDto[]>('/magazines')
      .then((magazines) => {
        const issue = magazines[0]?.issues?.[0];
        if (!issue) return;
        setFallback({
          id: issue.id,
          title: issue.title,
          number: issue.number,
          priceRial: issue.priceRial,
          qty: 1,
        });
      })
      .catch(() => undefined);
  }, [cart]);

  const items = cart?.items.length ? cart.items : fallback ? [fallback] : [];
  const shippingRial = cart?.shippingRial ?? 70_000;

  const initialAddress = useMemo(
    () => ({
      firstName: user?.firstName ?? user?.telegram?.firstName ?? user?.bale?.firstName ?? '',
      lastName: user?.lastName ?? user?.telegram?.lastName ?? user?.bale?.lastName ?? '',
      province: user?.province ?? 'تهران',
      city: user?.city ?? '',
      street: user?.street ?? '',
      postalCode: user?.postalCode ?? '',
      phone: user?.phone ?? '',
      notes: '',
    }),
    [user],
  );

  async function onSubmit(payload: CheckoutSubmitPayload) {
    setBusy(true);
    setError(null);
    try {
      const { provider, ...address } = payload;
      const order = await api<OrderDto>('/orders', {
        method: 'POST',
        body: JSON.stringify(address),
      });
      const intent = await api<PaymentIntentDto>('/payments/intent', {
        method: 'POST',
        body: JSON.stringify({ orderId: order.id, provider }),
      });
      if (intent.redirectUrl) {
        window.location.href = intent.redirectUrl;
        return;
      }
      setError('آدرس درگاه دریافت نشد');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای پرداخت');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <CheckoutScreen
        items={items}
        shippingRial={shippingRial}
        initialAddress={initialAddress}
        busy={busy}
        error={error}
        cryptoEnabled={false}
        onSubmit={onSubmit}
        onEditOrder={() => router.push('/cart')}
      />
    </AppShell>
  );
}
