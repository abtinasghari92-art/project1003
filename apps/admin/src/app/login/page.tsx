'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminSession } from '@majara/types';
import { api, getToken, setToken } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace('/');
  }, [router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const session = await api<AdminSession>('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(session.token);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ورود ناموفق بود');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <h1
          className="mb-1 text-4xl text-[var(--majara-red)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ماجرا
        </h1>
        <p className="mb-6 text-sm text-[var(--majara-muted)]">ورود به پنل ادمین</p>
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm font-bold">
            ایمیل
            <Input
              className="mt-1"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-bold">
            رمز عبور
            <Input
              className="mt-1"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>
          {error ? <p className="text-sm text-[var(--majara-red)]">{error}</p> : null}
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? 'در حال ورود...' : 'ورود'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
