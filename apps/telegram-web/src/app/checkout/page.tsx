'use client';

import { useState } from 'react';
import type { OrderDto, PaymentIntentDto } from '@majara/types';
import { AppShell } from '@/components/shell';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function CheckoutPage() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pay(provider: 'ZIBAL' | 'NOWPAYMENTS') {
    setBusy(true);
    setError(null);
    try {
      const order = await api<OrderDto>('/orders', { method: 'POST' });
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
      <h1 className="mb-4 font-[family-name:var(--font-display)] text-2xl">پرداخت</h1>
      <p className="mb-6 text-sm text-[var(--majara-muted)]">
        پرداخت ریالی با زیبال و پرداخت کریپتو با NowPayments.
      </p>
      <div className="space-y-3">
        <Button size="lg" disabled={busy} onClick={() => pay('ZIBAL')}>
          پرداخت ریالی — زیبال
        </Button>
        <Button size="lg" variant="outline" disabled={busy} onClick={() => pay('NOWPAYMENTS')}>
          پرداخت کریپتو — NowPayments
        </Button>
      </div>
      {error ? <p className="mt-4 text-sm text-[var(--majara-red)]">{error}</p> : null}
    </AppShell>
  );
}
