'use client';

import { useEffect, useState } from 'react';
import type { PublicUser } from '@majara/types';
import { AppShell } from '@/components/shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { ProfileHome } from '@majara/ui';

export default function ProfilePage() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
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
      <ProfileHome
        user={user}
        phoneVerification={!user?.phone ? (
          <div className="majara-panel p-4">
            <p className="text-sm font-bold">تایید شماره موبایل</p>
            <p className="mt-1 text-[12px] text-[var(--majara-muted)]">برای ثبت و ارسال سفارش، شماره‌تان را یک‌بار تایید کنید.</p>
            <div className="mt-3 space-y-3">
            <Input
              inputMode="numeric"
              placeholder="09xxxxxxxxx"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <Button
              size="lg"
              disabled={busy || !phone.trim()}
              onClick={async () => {
                setBusy(true);
                try {
                  await api('/auth/otp/send', {
                    method: 'POST',
                    body: JSON.stringify({ phone }),
                  });
                  setSent(true);
                  setCode('');
                  setMessage('کد تایید ارسال شد');
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : 'ارسال کد ناموفق بود');
                } finally {
                  setBusy(false);
                }
              }}
            >
              {sent ? 'ارسال دوباره کد' : 'ارسال کد تایید'}
            </Button>
              {sent ? (
              <>
                <Input
                  inputMode="numeric"
                  placeholder="کد تایید"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
                <Button
                  variant="outline"
                  size="lg"
                  disabled={busy || !code.trim()}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      const result = await api<{ user: PublicUser }>('/auth/otp/verify', {
                        method: 'POST',
                        body: JSON.stringify({ phone, code }),
                      });
                      setUser(result.user);
                      setMessage('شماره تایید شد');
                    } catch (error) {
                      setMessage(error instanceof Error ? error.message : 'تایید شماره ناموفق بود');
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  تایید شماره
                </Button>
              </>
              ) : null}
            </div>
            {message ? <p className="mt-3 text-sm text-[var(--majara-red)]">{message}</p> : null}
          </div>
        ) : undefined}
      />
    </AppShell>
  );
}
