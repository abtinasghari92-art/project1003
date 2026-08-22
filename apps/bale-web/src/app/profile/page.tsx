'use client';

import { useEffect, useState } from 'react';
import type { PublicUser } from '@majara/types';
import { AppShell } from '@/components/shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api<PublicUser>('/me')
      .then((me) => {
        setUser(me);
        setPhone(me.phone ?? '');
      })
      .catch(() => setUser(null));
  }, []);

  return (
    <AppShell>
      <h1 className="mb-4 font-[family-name:var(--font-display)] text-2xl">پروفایل</h1>
      <p className="mb-4 text-sm text-[var(--majara-muted)]">
        {user?.telegram?.firstName ?? user?.bale?.firstName ?? 'کاربر'}
      </p>
      {user?.phone ? (
        <p className="mb-4">موبایل تاییدشده: {user.phone}</p>
      ) : (
        <div className="space-y-3">
          <Input
            inputMode="numeric"
            placeholder="09xxxxxxxxx"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          <Button
            size="lg"
            onClick={async () => {
              await api('/auth/otp/send', {
                method: 'POST',
                body: JSON.stringify({ phone }),
              });
              setMessage('کد تایید ارسال شد');
            }}
          >
            ارسال کد کاوه‌نگار
          </Button>
          <Input
            inputMode="numeric"
            placeholder="کد تایید"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          <Button
            variant="outline"
            size="lg"
            onClick={async () => {
              const result = await api<{ user: PublicUser }>('/auth/otp/verify', {
                method: 'POST',
                body: JSON.stringify({ phone, code }),
              });
              setUser(result.user);
              setMessage('شماره تایید شد');
            }}
          >
            تایید شماره
          </Button>
        </div>
      )}
      {message ? <p className="mt-3 text-sm text-[var(--majara-red)]">{message}</p> : null}
    </AppShell>
  );
}
