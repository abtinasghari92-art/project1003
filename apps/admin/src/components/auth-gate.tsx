'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { api, clearToken, getToken } from '@/lib/api';
import { AdminShell } from './shell';

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    api('/admin/me')
      .then(() => setReady(true))
      .catch(() => {
        clearToken();
        router.replace('/login');
      });
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-[var(--majara-muted)]">
        در حال بررسی نشست...
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
