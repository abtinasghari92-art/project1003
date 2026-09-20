'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { AuthGate } from '@/components/auth-gate';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import type { DeliverySettings } from '@/lib/types';

const EMPTY_SETTINGS = {
  postShippingRial: '70000',
  courierTehranEnabled: false,
  courierTehranRial: '0',
};

export default function DeliveryPage() {
  return (
    <AuthGate>
      <DeliverySettingsForm />
    </AuthGate>
  );
}

function DeliverySettingsForm() {
  const [form, setForm] = useState(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const settings = await api<DeliverySettings>('/admin/delivery-settings');
      setForm({
        postShippingRial: String(settings.postShippingRial),
        courierTehranEnabled: settings.courierTehranEnabled,
        courierTehranRial: String(settings.courierTehranRial),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت تنظیمات ارسال');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const settings = await api<DeliverySettings>('/admin/delivery-settings', {
        method: 'PATCH',
        body: JSON.stringify({
          postShippingRial: Number(form.postShippingRial),
          courierTehranEnabled: form.courierTehranEnabled,
          courierTehranRial: Number(form.courierTehranRial),
        }),
      });
      setForm({
        postShippingRial: String(settings.postShippingRial),
        courierTehranEnabled: settings.courierTehranEnabled,
        courierTehranRial: String(settings.courierTehranRial),
      });
      setMessage(settings.courierTehranEnabled ? 'پیک تهران فعال و تنظیمات ذخیره شد.' : 'تنظیمات ذخیره شد؛ پیک تهران غیرفعال است.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ذخیره‌سازی ناموفق بود');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">روش‌های ارسال</h1>
        <p className="mt-1 text-sm text-[var(--majara-muted)]">قیمت‌ها به ریال‌اند و مبلغ نهایی هنگام ثبت سفارش در سرور محاسبه می‌شود.</p>
      </div>
      {error ? <p className="text-sm text-[var(--majara-red)]">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <Card>
        <form className="space-y-5" onSubmit={save}>
          <label className="block space-y-1.5 text-sm font-bold">
            هزینه ارسال پستی (ریال)
            <Input
              type="number"
              min={0}
              step={1000}
              value={form.postShippingRial}
              onChange={(event) => setForm({ ...form, postShippingRial: event.target.value })}
              disabled={loading || saving}
              required
            />
            <span className="block text-xs font-normal text-[var(--majara-muted)]">برای همهٔ استان‌ها در دسترس است.</span>
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-4 border-y border-black/10 py-4">
            <span>
              <span className="block font-bold">فعال‌سازی پیک تهران</span>
              <span className="mt-1 block text-xs text-[var(--majara-muted)]">فقط وقتی مشتری استان تهران را انتخاب کند نمایش داده می‌شود.</span>
            </span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-[var(--majara-red)]"
              checked={form.courierTehranEnabled}
              onChange={(event) => setForm({ ...form, courierTehranEnabled: event.target.checked })}
              disabled={loading || saving}
            />
          </label>
          <label className="block space-y-1.5 text-sm font-bold">
            هزینه پیک تهران (ریال)
            <Input
              type="number"
              min={0}
              step={1000}
              value={form.courierTehranRial}
              onChange={(event) => setForm({ ...form, courierTehranRial: event.target.value })}
              disabled={loading || saving}
              required={form.courierTehranEnabled}
            />
          </label>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading || saving}>{saving ? 'در حال ذخیره…' : 'ذخیره تنظیمات'}</Button>
            <Button type="button" variant="outline" onClick={() => void load()} disabled={loading || saving}>بازخوانی</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
