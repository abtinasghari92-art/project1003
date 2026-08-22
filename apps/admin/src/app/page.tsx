'use client';

import { useEffect, useState } from 'react';
import type { AdminStats } from '@majara/types';
import { AuthGate } from '@/components/auth-gate';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function DashboardPage() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  );
}

function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<AdminStats>('/admin/stats')
      .then(setStats)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'خطا'));
  }, []);

  const cards = [
    { label: 'مشتریان', value: stats?.customers },
    { label: 'سفارش پرداخت‌شده', value: stats?.paidOrders },
    { label: 'پرداخت در انتظار', value: stats?.pendingPayments },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">داشبورد</h1>
      {error ? <p className="text-sm text-[var(--majara-red)]">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <p className="text-sm text-[var(--majara-muted)]">{card.label}</p>
            <p className="mt-2 text-3xl font-bold">
              {card.value == null ? '—' : new Intl.NumberFormat('fa-IR').format(card.value)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
