'use client';

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { BrandIconTile } from './brand-icon';
import { DEFAULT_PROVINCE, IRAN_PROVINCES } from './iran-regions';

export type CheckoutLine = {
  id: string;
  title: string;
  number?: number;
  qty: number;
  priceRial: number;
};

export type CheckoutAddress = {
  firstName: string;
  lastName: string;
  province: string;
  city: string;
  street: string;
  postalCode: string;
  phone: string;
  notes: string;
};

export type CheckoutSubmitPayload = CheckoutAddress & {
  provider: 'ZIBAL' | 'NOWPAYMENTS';
  deliveryMethod: 'POST' | 'COURIER_TEHRAN';
};

export type CheckoutDeliveryOption = {
  id: 'POST' | 'COURIER_TEHRAN';
  title: string;
  description: string;
  shippingRial: number;
};

export interface CheckoutScreenProps {
  items: CheckoutLine[];
  shippingRial: number;
  deliveryOptions?: CheckoutDeliveryOption[];
  initialAddress?: Partial<CheckoutAddress>;
  busy?: boolean;
  error?: string | null;
  cryptoEnabled?: boolean;
  onProvinceChange?: (province: string) => void;
  onSubmit: (payload: CheckoutSubmitPayload) => void;
  onEditOrder: () => void;
}

const ISSUE_ORDINALS: Record<number, string> = {
  1: 'اول',
  2: 'دوم',
  3: 'سوم',
  4: 'چهارم',
  5: 'پنجم',
  6: 'ششم',
  7: 'هفتم',
  8: 'هشتم',
  9: 'نهم',
  10: 'دهم',
};

const EMPTY_ADDRESS: CheckoutAddress = {
  firstName: '',
  lastName: '',
  province: DEFAULT_PROVINCE,
  city: '',
  street: '',
  postalCode: '',
  phone: '',
  notes: '',
};

const DEFAULT_DELIVERY_OPTIONS: CheckoutDeliveryOption[] = [
  {
    id: 'POST',
    title: 'ارسال پستی',
    description: 'ارسال به همه شهرهای ایران',
    shippingRial: 0,
  },
];

const fieldClass =
  'majara-field h-11 w-full px-3 text-sm outline-none focus:border-[var(--majara-red)]';

function formatToman(amount: number) {
  return `${new Intl.NumberFormat('fa-IR-u-nu-latn').format(amount)} تومان`;
}

function toEnglishDigits(input: string) {
  return input
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - '۰'.charCodeAt(0)))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - '٠'.charCodeAt(0)));
}

export function issueLineTitle(title: string, number?: number) {
  if (!number) return title;
  const ordinal = ISSUE_ORDINALS[number] ?? String(number);
  return `فصل‌نامه ماجرا - شماره ${ordinal}`;
}

export function CheckoutScreen({
  items,
  shippingRial,
  deliveryOptions,
  initialAddress,
  busy = false,
  error,
  cryptoEnabled = false,
  onProvinceChange,
  onSubmit,
  onEditOrder,
}: CheckoutScreenProps): ReactNode {
  const [form, setForm] = useState<CheckoutAddress>(EMPTY_ADDRESS);
  const [provider, setProvider] = useState<'ZIBAL' | 'NOWPAYMENTS'>('ZIBAL');
  const [deliveryMethod, setDeliveryMethod] = useState<'POST' | 'COURIER_TEHRAN'>('POST');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CheckoutAddress, string>>>({});

  useEffect(() => {
    setForm((prev) => ({
      firstName: prev.firstName || initialAddress?.firstName || '',
      lastName: prev.lastName || initialAddress?.lastName || '',
      province: prev.province || initialAddress?.province || DEFAULT_PROVINCE,
      city: prev.city || initialAddress?.city || '',
      street: prev.street || initialAddress?.street || '',
      postalCode: prev.postalCode || initialAddress?.postalCode || '',
      phone: prev.phone || initialAddress?.phone || '',
      notes: prev.notes || initialAddress?.notes || '',
    }));
  }, [initialAddress]);

  useEffect(() => {
    if (!cryptoEnabled) setProvider('ZIBAL');
  }, [cryptoEnabled]);

  const availableDeliveryOptions = deliveryOptions?.length
    ? deliveryOptions
    : DEFAULT_DELIVERY_OPTIONS.map((option) => ({ ...option, shippingRial }));
  const selectedDelivery =
    availableDeliveryOptions.find((option) => option.id === deliveryMethod) ?? availableDeliveryOptions[0];
  const currentShippingRial = selectedDelivery?.shippingRial ?? shippingRial;

  useEffect(() => {
    if (!availableDeliveryOptions.some((option) => option.id === deliveryMethod)) {
      setDeliveryMethod(availableDeliveryOptions[0]?.id ?? 'POST');
    }
  }, [availableDeliveryOptions, deliveryMethod]);

  const cities = useMemo(
    () => IRAN_PROVINCES.find((item) => item.name === form.province)?.cities ?? [],
    [form.province],
  );

  const subtotal = items.reduce((sum, item) => sum + item.priceRial * item.qty, 0);
  const total = subtotal + currentShippingRial;

  function setField<K extends keyof CheckoutAddress>(key: K, value: CheckoutAddress[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof CheckoutAddress, string>> = {};
    if (form.firstName.trim().length < 2) next.firstName = 'نام را وارد کنید';
    if (form.lastName.trim().length < 2) next.lastName = 'نام خانوادگی را وارد کنید';
    if (!form.province) next.province = 'استان را انتخاب کنید';
    if (!form.city) next.city = 'شهر را انتخاب کنید';
    if (form.street.trim().length < 5) next.street = 'آدرس خیابان را وارد کنید';
    if (!/^\d{10}$/.test(toEnglishDigits(form.postalCode).replace(/\s/g, ''))) {
      next.postalCode = 'کدپستی باید ۱۰ رقم انگلیسی و بدون فاصله باشد';
    }
    const phone = toEnglishDigits(form.phone).replace(/[^\d]/g, '');
    if (!/^09\d{9}$/.test(phone) && !/^9\d{9}$/.test(phone)) {
      next.phone = 'شماره موبایل نامعتبر است';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy || items.length === 0) return;
    if (!validate()) return;
    onSubmit({
      ...form,
      postalCode: toEnglishDigits(form.postalCode).replace(/\s/g, ''),
      phone: toEnglishDigits(form.phone).replace(/[^\d]/g, ''),
      provider,
      deliveryMethod: selectedDelivery?.id ?? 'POST',
    });
  }

  return (
    <form className="space-y-8 pb-4" onSubmit={handleSubmit}>
      <p className="majara-panel border-[var(--majara-gold)] px-3 py-2.5 text-[12px] leading-6 text-[var(--majara-muted)]">
        اگر نیاز خاصی برای ثبت سفارش دارید اینجا برای ما مطرح کنید
      </p>

      <section>
        <h1 className="mb-4 flex items-center gap-2.5 border-b border-black/15 pb-2 text-[1.35rem] font-bold">
          <BrandIconTile name="iran" size={26} />
          صورت حساب و حمل و نقل
        </h1>
        <div className="space-y-4">
          <Field label="نام" required error={fieldErrors.firstName}>
            <input
              className={fieldClass}
              value={form.firstName}
              onChange={(event) => setField('firstName', event.target.value)}
              autoComplete="given-name"
            />
          </Field>
          <Field label="نام خانوادگی" required error={fieldErrors.lastName}>
            <input
              className={fieldClass}
              value={form.lastName}
              onChange={(event) => setField('lastName', event.target.value)}
              autoComplete="family-name"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="استان" required error={fieldErrors.province}>
              <select
                className={fieldClass}
                value={form.province}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, province: event.target.value, city: '' }));
                  setFieldErrors((prev) => ({ ...prev, province: undefined, city: undefined }));
                  onProvinceChange?.(event.target.value);
                }}
              >
                {IRAN_PROVINCES.map((province) => (
                  <option key={province.name} value={province.name}>
                    {province.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="شهر" required error={fieldErrors.city}>
              <select
                className={fieldClass}
                value={form.city}
                onChange={(event) => setField('city', event.target.value)}
              >
                <option value="">یک شهر انتخاب کنید...</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="آدرس خیابان" required error={fieldErrors.street}>
            <input
              className={fieldClass}
              value={form.street}
              placeholder="نام خیابان و پلاک خانه"
              onChange={(event) => setField('street', event.target.value)}
              autoComplete="street-address"
            />
          </Field>
          <Field
            label="کدپستی (بدون فاصله و با اعداد انگلیسی)"
            required
            error={fieldErrors.postalCode}
          >
            <input
              className={fieldClass}
              value={form.postalCode}
              inputMode="numeric"
              maxLength={10}
              onChange={(event) =>
                setField('postalCode', toEnglishDigits(event.target.value).replace(/[^\d]/g, ''))
              }
              autoComplete="postal-code"
            />
          </Field>
          <Field
            label={
              <span className="inline-flex items-center gap-2">
                <BrandIconTile name="call" size={24} />
                تلفن
              </span>
            }
            required
            error={fieldErrors.phone}
          >
            <input
              className={fieldClass}
              value={form.phone}
              inputMode="tel"
              placeholder="09120000000"
              onChange={(event) => setField('phone', toEnglishDigits(event.target.value))}
              autoComplete="tel"
            />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="mb-4 border-t border-black/15 pt-5 text-[1.15rem] font-bold">نحوه ارسال</h2>
        <div className="space-y-2">
          {availableDeliveryOptions.map((option) => (
            <label
              key={option.id}
              className={`majara-field flex cursor-pointer items-center justify-between gap-3 px-4 py-3 ${
                deliveryMethod === option.id ? 'border-[var(--majara-red)]' : 'border-[var(--majara-silver)]'
              }`}
            >
              <span className="flex items-start gap-3">
                <input
                  type="radio"
                  className="mt-1 accent-[var(--majara-red)]"
                  name="delivery-method"
                  checked={deliveryMethod === option.id}
                  onChange={() => setDeliveryMethod(option.id)}
                />
                <span>
                  <span className="block text-sm font-bold">{option.title}</span>
                  <span className="mt-1 block text-xs text-[var(--majara-muted)]">{option.description}</span>
                </span>
              </span>
              <strong className="shrink-0 text-[13px]">{formatToman(option.shippingRial)}</strong>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 border-t border-black/15 pt-5 text-[1.15rem] font-bold">توضیحات تکمیلی</h2>
        <Field label="یادداشت های سفارش (اختیاری)">
          <textarea
            className="majara-field min-h-24 w-full px-3 py-2 text-sm outline-none focus:border-[var(--majara-red)]"
            value={form.notes}
            placeholder="اگر نیاز خاصی برای ثبت سفارش دارید اینجا برای ما مطرح کنید"
            onChange={(event) => setField('notes', event.target.value)}
          />
        </Field>
      </section>

      <section className="majara-panel">
        <h2 className="border-b border-[var(--majara-silver)] px-4 py-3 text-[1.15rem] font-bold">سفارش شما</h2>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[var(--majara-silver)] text-[var(--majara-muted)]">
              <th className="px-4 py-2 text-right font-medium">محصول</th>
              <th className="px-4 py-2 text-left font-medium">جمع جزء</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-[var(--majara-silver)]">
                <td className="px-4 py-3 leading-6">
                  {issueLineTitle(item.title, item.number)}
                  <span className="mt-1 block text-[12px] text-[var(--majara-muted)]">
                    {item.qty} × {formatToman(item.priceRial)}
                  </span>
                </td>
                <td className="px-4 py-3 text-left">{formatToman(item.priceRial * item.qty)}</td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-[var(--majara-muted)]" colSpan={2}>
                  سبد خرید خالی است.
                </td>
              </tr>
            ) : null}
            <tr className="border-b border-[var(--majara-silver)]">
              <th className="px-4 py-3 text-right font-medium">جمع جزء</th>
              <td className="px-4 py-3 text-left">{formatToman(subtotal)}</td>
            </tr>
            <tr className="border-b border-[var(--majara-silver)]">
              <th className="px-4 py-3 text-right font-medium">حمل و نقل</th>
              <td className="px-4 py-3 text-left leading-6">
                {selectedDelivery?.title ?? 'بسته‌بندی و ارسال'}: {formatToman(currentShippingRial)}
              </td>
            </tr>
            <tr>
              <th className="px-4 py-3 text-right font-bold">مجموع</th>
              <td className="majara-price px-4 py-3 text-left">{formatToman(total)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div className="space-y-3">
        <p className="border border-[var(--majara-red)] px-3 py-2.5 text-[13px] font-bold leading-6 text-[var(--majara-red)]">
          برای پرداخت، فیلترشکن (VPN) را خاموش کنید
        </p>
        {cryptoEnabled ? (
          <>
            <label
              className={`majara-field flex h-12 cursor-pointer items-center justify-between px-4 ${
                provider === 'ZIBAL' ? 'border-[var(--majara-charcoal)]' : 'border-[var(--majara-silver)]'
              }`}
            >
              <span className="flex items-center gap-2 text-[13px] font-bold">
                <input
                  type="radio"
                  className="accent-[var(--majara-red)]"
                  name="provider"
                  checked={provider === 'ZIBAL'}
                  onChange={() => setProvider('ZIBAL')}
                />
                پرداخت بانکی
              </span>
              <BankPayIcon />
            </label>
            <label
              className={`majara-field flex h-12 cursor-pointer items-center justify-between px-4 ${
                provider === 'NOWPAYMENTS' ? 'border-[var(--majara-charcoal)]' : 'border-[var(--majara-silver)]'
              }`}
            >
              <span className="flex items-center gap-2 text-[13px] font-bold">
                <input
                  type="radio"
                  className="accent-[var(--majara-red)]"
                  name="provider"
                  checked={provider === 'NOWPAYMENTS'}
                  onChange={() => setProvider('NOWPAYMENTS')}
                />
                پرداخت کریپتو
              </span>
            </label>
          </>
        ) : (
          <div className="majara-field flex h-12 items-center justify-between px-4">
            <span className="text-[13px] font-bold">پرداخت بانکی</span>
            <BankPayIcon />
          </div>
        )}
        <button
          type="button"
          onClick={onEditOrder}
          className="flex h-12 w-full items-center justify-center rounded-[var(--radius)] bg-[var(--majara-charcoal)] text-[14px] font-bold text-white"
        >
          ویرایش سفارش
        </button>
        <button
          type="submit"
          disabled={busy || items.length === 0}
          className="flex h-12 w-full items-center justify-center rounded-[var(--radius)] bg-[var(--majara-red)] text-[15px] font-bold text-white disabled:opacity-50"
        >
          {busy ? 'در حال ثبت...' : 'ثبت سفارش'}
        </button>
        {error ? <p className="text-sm text-[var(--majara-red)]">{error}</p> : null}
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: ReactNode;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px]">
        {label}
        {required ? <span className="text-[var(--majara-red)]"> *</span> : null}
      </span>
      {children}
      {error ? <span className="mt-1 block text-[11px] text-[var(--majara-red)]">{error}</span> : null}
    </label>
  );
}

function BankPayIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#1d4f9a" />
      <path d="M8 16.5 14 22 24 10" fill="none" stroke="#f5c400" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}
