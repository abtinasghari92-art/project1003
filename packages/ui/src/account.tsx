'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  Bell,
  CaretLeft,
  CheckCircle,
  Headset,
  Info,
  MapPin,
  Package,
  PencilSimple,
  Plus,
  ShoppingBag,
  Trash,
  UserCircle,
} from '@phosphor-icons/react';
import { formatToman } from './catalog';
import { IRAN_PROVINCES } from './iran-regions';

type PublicUser = {
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  telegram?: { username: string | null; firstName: string | null; lastName: string | null };
  bale?: { username: string | null; firstName: string | null; lastName: string | null };
};

type SavedAddressDto = {
  id: string; label: string; firstName: string; lastName: string; phone: string; province: string; city: string;
  street: string; postalCode: string; isDefault: boolean; createdAt: string; updatedAt: string;
};

type OrderDto = {
  id: string; status: 'DRAFT' | 'PENDING_PAYMENT' | 'PAID' | 'CANCELED'; amountRial: number; createdAt: string;
  items: { id: string; title: string; qty: number }[];
};

type ApiRequest = <T>(path: string, init?: RequestInit) => Promise<T>;

type AddressForm = {
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  province: string;
  city: string;
  street: string;
  postalCode: string;
  isDefault: boolean;
};

const EMPTY_ADDRESS: AddressForm = {
  label: 'آدرس جدید', firstName: '', lastName: '', phone: '', province: 'تهران', city: '', street: '', postalCode: '', isDefault: false,
};

const FIELD_CLASS = 'h-11 w-full rounded-xl border border-black/12 bg-white px-3 text-sm outline-none transition focus:border-[var(--majara-red)]';

function displayName(user: PublicUser | null) {
  const identity = user?.telegram ?? user?.bale;
  return [user?.firstName ?? identity?.firstName, user?.lastName ?? identity?.lastName].filter(Boolean).join(' ') || 'کاربر ماجرا';
}

function AccountRow({ href, icon, title, description }: { href: string; icon: ReactNode; title: string; description: string }) {
  return (
    <a href={href} className="flex items-center gap-3 border-b border-black/8 px-1 py-4 last:border-b-0">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--majara-red)_8%,white)] text-[var(--majara-red)]">{icon}</span>
      <span className="min-w-0 flex-1">
        <strong className="block text-[15px]">{title}</strong>
        <small className="mt-1 block text-[12px] text-[var(--majara-muted)]">{description}</small>
      </span>
      <CaretLeft size={19} weight="bold" className="text-[var(--majara-muted)]" />
    </a>
  );
}

export function ProfileHome({ user, phoneVerification }: { user: PublicUser | null; phoneVerification?: ReactNode }) {
  const name = displayName(user);
  const identity = user?.telegram ?? user?.bale;

  return (
    <div className="pb-3">
      <h1 className="mb-5 text-[1.45rem] font-bold">حساب کاربری</h1>
      <section className="mb-7 flex items-center gap-4 rounded-[20px] border border-black/6 bg-white px-4 py-5 shadow-[0_10px_28px_rgba(60,60,59,.05)]">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[var(--majara-red)] text-white"><UserCircle size={43} weight="fill" /></span>
        <div className="min-w-0">
          <h2 className="truncate text-[1.1rem] font-bold">{name}</h2>
          {user?.phone ? (
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[var(--majara-muted)]"><CheckCircle size={17} weight="fill" className="text-[var(--majara-red)]" /> {user.phone}</p>
          ) : identity?.username ? (
            <p className="mt-1 text-[13px] text-[var(--majara-muted)]">@{identity.username}</p>
          ) : <p className="mt-1 text-[13px] text-[var(--majara-muted)]">حساب کاربری ماجرا</p>}
        </div>
      </section>
      {phoneVerification ? <section className="mb-6">{phoneVerification}</section> : null}
      <section className="border-t border-black/8">
        <AccountRow href="/profile/orders" icon={<ShoppingBag size={23} weight="regular" />} title="خریدهای من" description="مشاهدهٔ تاریخچه و وضعیت سفارش‌ها" />
        <AccountRow href="/profile/addresses" icon={<MapPin size={23} weight="regular" />} title="آدرس‌های من" description="افزودن و مدیریت آدرس‌های ارسال" />
      </section>
      <section className="mt-6 border-t border-black/8">
        <AccountRow href="/profile/about" icon={<Info size={23} weight="regular" />} title="دربارهٔ ما" description="آشنایی با فصل‌نامهٔ ماجرا" />
        <AccountRow href="/profile#notifications" icon={<Bell size={23} weight="regular" />} title="اعلان‌ها" description="مدیریت خبرهای خرید و انتشار شماره‌ها" />
        <AccountRow href="/profile#support" icon={<Headset size={23} weight="regular" />} title="پشتیبانی" description="پاسخ به سوال‌ها و دریافت راهنمایی" />
      </section>
    </div>
  );
}

function addressFormFrom(address: SavedAddressDto): AddressForm {
  return {
    label: address.label, firstName: address.firstName, lastName: address.lastName, phone: address.phone,
    province: address.province, city: address.city, street: address.street, postalCode: address.postalCode, isDefault: address.isDefault,
  };
}

function AddressEditor({ value, onChange, onSubmit, busy, cancel }: {
  value: AddressForm; onChange: (value: AddressForm) => void; onSubmit: () => void; busy: boolean; cancel: () => void;
}) {
  const field = <K extends keyof AddressForm>(key: K, next: AddressForm[K]) => onChange({ ...value, [key]: next });
  return (
    <form className="mt-4 space-y-3 border-t border-black/8 pt-4" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
      <input className={FIELD_CLASS} value={value.label} onChange={(event) => field('label', event.target.value)} placeholder="نام آدرس؛ مثلاً خانه" required />
      <div className="grid grid-cols-2 gap-3">
        <input className={FIELD_CLASS} value={value.firstName} onChange={(event) => field('firstName', event.target.value)} placeholder="نام" required />
        <input className={FIELD_CLASS} value={value.lastName} onChange={(event) => field('lastName', event.target.value)} placeholder="نام خانوادگی" required />
      </div>
      <input className={FIELD_CLASS} dir="ltr" inputMode="numeric" value={value.phone} onChange={(event) => field('phone', event.target.value)} placeholder="0912xxxxxxx" required />
      <div className="grid grid-cols-2 gap-3">
        <select className={FIELD_CLASS} value={value.province} onChange={(event) => field('province', event.target.value)}>{IRAN_PROVINCES.map((province) => <option key={province.name} value={province.name}>{province.name}</option>)}</select>
        <input className={FIELD_CLASS} value={value.city} onChange={(event) => field('city', event.target.value)} placeholder="شهر" required />
      </div>
      <input className={FIELD_CLASS} value={value.street} onChange={(event) => field('street', event.target.value)} placeholder="آدرس کامل" required />
      <input className={FIELD_CLASS} dir="ltr" inputMode="numeric" value={value.postalCode} onChange={(event) => field('postalCode', event.target.value)} placeholder="کدپستی ۱۰ رقمی" required />
      <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={value.isDefault} onChange={(event) => field('isDefault', event.target.checked)} className="h-4 w-4 accent-[var(--majara-red)]" /> آدرس پیش‌فرض سفارش‌ها</label>
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="flex-1 rounded-xl bg-[var(--majara-red)] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? 'در حال ذخیره...' : 'ذخیرهٔ آدرس'}</button>
        <button type="button" onClick={cancel} className="rounded-xl border border-black/12 px-4 py-3 text-sm font-bold">انصراف</button>
      </div>
    </form>
  );
}

export function AddressesScreen({ request }: { request: ApiRequest }) {
  const [addresses, setAddresses] = useState<SavedAddressDto[]>([]);
  const [form, setForm] = useState<AddressForm | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = () => request<SavedAddressDto[]>('/addresses').then(setAddresses).catch(() => setMessage('دریافت آدرس‌ها ناموفق بود'));
  useEffect(() => { void load(); }, []);

  async function save() {
    if (!form) return;
    setBusy(true); setMessage(null);
    try {
      const path = editingId ? `/addresses/${editingId}` : '/addresses';
      await request<SavedAddressDto>(path, { method: editingId ? 'PATCH' : 'POST', body: JSON.stringify(form) });
      await load(); setForm(null); setEditingId(null);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'ذخیرهٔ آدرس ناموفق بود'); } finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!window.confirm('این آدرس حذف شود؟')) return;
    setBusy(true); setMessage(null);
    try { await request(`/addresses/${id}`, { method: 'DELETE' }); await load(); } catch (error) { setMessage(error instanceof Error ? error.message : 'حذف آدرس ناموفق بود'); } finally { setBusy(false); }
  }

  return (
    <div className="pb-3">
      <div className="mb-5 flex items-center justify-between gap-3"><div><h1 className="text-[1.45rem] font-bold">آدرس‌های من</h1><p className="mt-1 text-[12px] text-[var(--majara-muted)]">آدرس پیش‌فرض در سفارش بعدی استفاده می‌شود.</p></div><button type="button" onClick={() => { setForm({ ...EMPTY_ADDRESS }); setEditingId(null); }} className="grid h-10 w-10 place-items-center rounded-full bg-[var(--majara-red)] text-white" aria-label="افزودن آدرس"><Plus size={20} weight="bold" /></button></div>
      {message ? <p className="mb-3 text-sm font-bold text-[var(--majara-red)]">{message}</p> : null}
      {form ? <section className="mb-5 rounded-[18px] border border-black/10 bg-white p-4"><h2 className="font-bold">{editingId ? 'ویرایش آدرس' : 'افزودن آدرس'}</h2><AddressEditor value={form} onChange={setForm} onSubmit={() => void save()} busy={busy} cancel={() => { setForm(null); setEditingId(null); }} /></section> : null}
      <div className="space-y-3">
        {addresses.map((address) => <article key={address.id} className="rounded-[18px] border border-black/9 bg-white p-4 shadow-[0_8px_22px_rgba(60,60,59,.04)]"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--majara-red)_8%,white)] text-[var(--majara-red)]"><MapPin size={21} weight="fill" /></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="font-bold">{address.label}</h2>{address.isDefault ? <span className="text-[11px] font-bold text-[var(--majara-red)]">پیش‌فرض</span> : null}</div><p className="mt-1 text-[12px] leading-5 text-[var(--majara-muted)]">{address.province}، {address.city}، {address.street}</p><p className="mt-1 text-[12px] text-[var(--majara-muted)]">{address.firstName} {address.lastName} · {address.phone}</p></div></div><div className="mt-3 flex justify-end gap-2"><button type="button" disabled={busy} onClick={() => { setForm(addressFormFrom(address)); setEditingId(address.id); }} className="inline-flex items-center gap-1 rounded-lg border border-black/10 px-3 py-2 text-xs font-bold"><PencilSimple size={15} /> ویرایش</button><button type="button" disabled={busy} onClick={() => void remove(address.id)} className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-bold text-[var(--majara-red)]"><Trash size={16} /> حذف</button></div></article>)}
        {!addresses.length && !form ? <div className="border-y border-black/8 py-10 text-center"><MapPin size={30} className="mx-auto text-[var(--majara-red)]" /><p className="mt-3 font-bold">هنوز آدرسی ذخیره نکرده‌اید.</p><p className="mt-1 text-sm text-[var(--majara-muted)]">برای خرید سریع‌تر یک آدرس اضافه کنید.</p></div> : null}
      </div>
    </div>
  );
}

const ORDER_STATUS: Record<OrderDto['status'], string> = { DRAFT: 'پیش‌نویس', PENDING_PAYMENT: 'در انتظار پرداخت', PAID: 'پرداخت‌شده', CANCELED: 'لغوشده' };

export function OrderHistoryScreen({ request }: { request: ApiRequest }) {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { request<OrderDto[]>('/orders').then(setOrders).catch(() => setMessage('دریافت خریدها ناموفق بود')); }, [request]);
  return (
    <div className="pb-3"><div className="mb-5"><h1 className="text-[1.45rem] font-bold">خریدهای من</h1><p className="mt-1 text-[12px] text-[var(--majara-muted)]">تاریخچه و وضعیت تمام سفارش‌ها</p></div>{message ? <p className="text-sm font-bold text-[var(--majara-red)]">{message}</p> : null}<div className="space-y-3">{orders.map((order) => <article key={order.id} className="rounded-[18px] border border-black/9 bg-white p-4 shadow-[0_8px_22px_rgba(60,60,59,.04)]"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--majara-red)_8%,white)] text-[var(--majara-red)]"><Package size={21} weight="regular" /></span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h2 className="font-bold">سفارش {order.id.slice(-6)}</h2><span className="text-[11px] font-bold text-[var(--majara-red)]">{ORDER_STATUS[order.status]}</span></div><p className="mt-1 text-[12px] text-[var(--majara-muted)]">{new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(order.createdAt))}</p><p className="mt-3 text-sm leading-6">{order.items.map((item) => `${item.title}${item.qty > 1 ? ` × ${item.qty}` : ''}`).join('، ')}</p><div className="mt-3 flex justify-between border-t border-black/8 pt-3 text-sm"><span className="text-[var(--majara-muted)]">مبلغ پرداختی</span><strong>{formatToman(order.amountRial)}</strong></div></div></div></article>)}{!orders.length && !message ? <div className="border-y border-black/8 py-10 text-center"><ShoppingBag size={30} className="mx-auto text-[var(--majara-red)]" /><p className="mt-3 font-bold">هنوز خریدی ندارید.</p><a href="/magazines" className="mt-3 inline-block text-sm font-bold text-[var(--majara-red)]">مشاهدهٔ مجله‌ها</a></div> : null}</div></div>
  );
}
