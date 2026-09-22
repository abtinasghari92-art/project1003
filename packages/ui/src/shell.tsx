'use client';

import type { Icon } from '@phosphor-icons/react';
import { Books, CaretRight, House, ShoppingCartSimple, User } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { formatFa } from './catalog';
import { LogoMark } from './mark';
import { PromoModal } from './promo-modal';

export const CART_CHANGED_EVENT = 'majara:cart-changed';

export function notifyCartChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
}

const links: { href: string; label: string; icon: Icon }[] = [
  { href: '/magazines', label: 'خانه', icon: House },
  { href: '/archive', label: 'آرشیو', icon: Books },
  { href: '/cart', label: 'سبد', icon: ShoppingCartSimple },
  { href: '/profile', label: 'پروفایل', icon: User },
];

function CartBadge({ count, placement }: { count: number; placement: 'header' | 'nav' }) {
  if (count <= 0) return null;
  const label = count > 99 ? '۹۹+' : formatFa(count);

  return (
    <span
      className={`majara-cart-badge majara-cart-badge--${placement}`}
      aria-label={`${formatFa(count)} کالا در سبد خرید`}
    >
      {label}
    </span>
  );
}

export function AppShell({
  pathname,
  cartCount = 0,
  children,
}: {
  pathname: string;
  cartCount?: number;
  children: ReactNode;
}) {
  const showBack = pathname !== '/magazines';

  function goBack() {
    const sameAppReferrer = document.referrer.startsWith(window.location.origin);
    if (window.history.length > 1 && sameAppReferrer) {
      window.history.back();
      return;
    }
    window.location.assign('/magazines');
  }

  return (
    <div className="majara-kraft-bg mx-auto flex min-h-dvh max-w-md flex-col">
      {pathname === '/magazines' ? <PromoModal /> : null}
      <header className="majara-kraft-bg sticky top-0 z-20 flex items-center justify-between px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          {showBack ? (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex h-10 items-center gap-0.5 rounded-full bg-white px-3 text-[12px] font-bold text-[var(--majara-charcoal)] shadow-[0_8px_22px_rgba(60,60,59,.08)]"
              aria-label="بازگشت"
            >
              <CaretRight size={17} weight="bold" />
              بازگشت
            </button>
          ) : null}
          <a href="/magazines" className="flex min-w-0 items-center text-[var(--majara-charcoal)]" aria-label="ماجرا">
            <LogoMark size={46} />
          </a>
        </div>
        <a
          href="/cart"
          aria-label="سبد خرید"
          className="relative grid h-11 w-11 place-items-center rounded-full bg-white text-[var(--majara-charcoal)] shadow-[0_8px_22px_rgba(60,60,59,.08)]"
        >
          <ShoppingCartSimple size={20} weight="regular" />
          <CartBadge count={cartCount} placement="header" />
        </a>
      </header>
      <main className="flex-1 px-4 py-4 pb-24">{children}</main>
      <nav
        className="sticky bottom-0 z-20 grid min-h-[64px] grid-cols-4 items-center"
        style={{
          background: 'color-mix(in srgb, var(--majara-paper) 55%, white)',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -8px 24px rgba(60,60,59,.08)',
          borderTop: '1px solid color-mix(in srgb, var(--majara-charcoal) 10%, transparent)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {links.map((link) => {
          const active =
            link.href === '/magazines'
              ? pathname === '/magazines' || pathname.startsWith('/issues')
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          return (
            <a
              key={link.href}
              href={link.href}
              className="relative flex flex-col items-center"
              style={{
                color: active ? 'var(--majara-red)' : 'color-mix(in srgb, var(--majara-charcoal) 55%, transparent)',
                gap: 3,
                fontSize: 11,
                fontWeight: active ? 700 : 500,
              }}
            >
              <span
                className="relative grid h-8 w-8 place-items-center rounded-full"
                style={{
                  background: active ? 'color-mix(in srgb, var(--majara-red) 12%, transparent)' : 'transparent',
                }}
              >
                <Icon size={18} weight={active ? 'fill' : 'regular'} />
                {link.href === '/cart' ? <CartBadge count={cartCount} placement="nav" /> : null}
              </span>
              {link.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
