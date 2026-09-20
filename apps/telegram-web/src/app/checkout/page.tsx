'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  CartDto,
  OrderDto,
  PaymentIntentDto,
  PublicUser,
  ShippingOptionDto,
} from '@majara/types';
import { CheckoutScreen, type CheckoutSubmitPayload } from '@majara/ui';
import { AppShell } from '@/components/shell';
import { api } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [deliveryOptions, setDeliveryOptions] = useState<ShippingOptionDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void Promise.all([api<CartDto>('/cart'), api<PublicUser>('/me')])
      .then(([nextCart, nextUser]) => {
        setCart(nextCart);
        setUser(nextUser);
        return api<ShippingOptionDto[]>('/shipping/quote', {
          method: 'POST',
          body: JSON.stringify({ province: nextUser.province ?? 'تهران' }),
        });
      })
      .then(setDeliveryOptions)
      .catch(() => {
        setCart(null);
        setUser(null);
        setDeliveryOptions([]);
      });
  }, []);

  const items = cart?.items ?? [];
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

  async function refreshDeliveryOptions(province: string) {
    try {
      setDeliveryOptions(
        await api<ShippingOptionDto[]>('/shipping/quote', {
          method: 'POST',
          body: JSON.stringify({ province }),
        }),
      );
    } catch {
      setDeliveryOptions([]);
    }
  }

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
        deliveryOptions={deliveryOptions}
        initialAddress={initialAddress}
        busy={busy}
        error={error}
        cryptoEnabled
        onProvinceChange={(province) => void refreshDeliveryOptions(province)}
        onSubmit={onSubmit}
        onEditOrder={() => router.push('/cart')}
      />
    </AppShell>
  );
}
