'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { AuthGate } from '@/components/auth-gate';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { api } from '@/lib/api';
import type { PromotionCampaign } from '@/lib/types';

const EMPTY_CAMPAIGN = {
  active: false,
  code: '',
  discountPercent: '50',
  title: 'تخفیف ویژه خرید',
  description: 'کد تخفیف را کپی کنید و هنگام پرداخت وارد کنید.',
};

export default function PromotionPage() {
  return (
    <AuthGate>
      <PromotionSettings />
    </AuthGate>
  );
}

function PromotionSettings() {
  const [form, setForm] = useState(EMPTY_CAMPAIGN);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const campaign = await api<PromotionCampaign>('/admin/promotion');
      setForm({
        active: campaign.active,
        code: campaign.code,
        discountPercent: String(campaign.discountPercent || 50),
        title: campaign.title,
        description: campaign.description,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت تنظیمات');
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
      const campaign = await api<PromotionCampaign>('/admin/promotion', {
        method: 'PATCH',
        body: JSON.stringify({
          active: form.active,
          code: form.code,
          discountPercent: Number(form.discountPercent),
          title: form.title,
          description: form.description,
        }),
      });
      setForm((current) => ({ ...current, code: campaign.code, discountPercent: String(campaign.discountPercent) }));
      setMessage(campaign.active ? 'پاپ‌آپ تخفیف فعال شد.' : 'پاپ‌آپ تخفیف غیرفعال شد.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ذخیره‌سازی ناموفق بود');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">پاپ‌آپ کد تخفیف</h1>
        <p className="mt-1 text-sm text-[var(--majara-muted)]">تنظیماتی که کاربران فروشگاه در بازدید بعدی می‌بینند.</p>
      </div>
      {error ? <p className="text-sm text-[var(--majara-red)]">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <Card>
        <form className="space-y-4" onSubmit={save}>
          <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-black/10 pb-4">
            <span>
              <span className="block font-bold">نمایش پاپ‌آپ</span>
              <span className="mt-1 block text-xs text-[var(--majara-muted)]">تا وقتی فعال نباشد، کاربران هیچ پاپ‌آپی نمی‌بینند.</span>
            </span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-[var(--majara-red)]"
              checked={form.active}
              onChange={(event) => setForm({ ...form, active: event.target.checked })}
              disabled={loading || saving}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
            <label className="space-y-1.5 text-sm font-bold">
              کد تخفیف
              <Input
                dir="ltr"
                className="text-left uppercase"
                value={form.code}
                onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
                placeholder="FIRST50"
                minLength={3}
                maxLength={32}
                required={form.active}
                disabled={loading || saving}
              />
            </label>
            <label className="space-y-1.5 text-sm font-bold">
              درصد تخفیف
              <Input
                type="number"
                min={1}
                max={100}
                value={form.discountPercent}
                onChange={(event) => setForm({ ...form, discountPercent: event.target.value })}
                required={form.active}
                disabled={loading || saving}
              />
            </label>
          </div>
          <label className="block space-y-1.5 text-sm font-bold">
            عنوان پاپ‌آپ
            <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required disabled={loading || saving} />
          </label>
          <label className="block space-y-1.5 text-sm font-bold">
            متن توضیحی
            <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={300} disabled={loading || saving} />
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
