'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/shell';
import { Button } from '@/components/ui/button';

function ResultBody() {
  const params = useSearchParams();
  const status = params.get('status');
  const paid = status === 'paid';
  return (
    <AppShell>
      <h1 className="mb-3 font-[family-name:var(--font-display)] text-2xl">{paid ? 'پرداخت موفق' : 'پرداخت ناموفق'}</h1>
      <p className="mb-6 text-sm text-[var(--majara-muted)]">
        درگاه: {params.get('provider') ?? '—'}
      </p>
      <Link href="/magazines">
        <Button size="lg">بازگشت به مجلات</Button>
      </Link>
    </AppShell>
  );
}

export default function PayResultPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">...</div>}>
      <ResultBody />
    </Suspense>
  );
}
