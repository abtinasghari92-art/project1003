'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { BookOpen, LayoutDashboard, LogOut, ShoppingBag, Users } from 'lucide-react';
import { clearToken } from '@/lib/api';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/customers', label: 'مشتریان', icon: Users },
  { href: '/orders', label: 'سفارش‌ها', icon: ShoppingBag },
  { href: '/catalog', label: 'کاتالوگ', icon: BookOpen },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex min-h-dvh bg-[var(--majara-paper)]">
      <aside className="sticky top-0 flex h-dvh w-56 shrink-0 flex-col bg-[var(--majara-chrome)] text-white">
        <Link
          href="/"
          className="border-b border-white/10 px-5 py-5 text-[28px] leading-none text-[var(--majara-red)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ماجرا
        </Link>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {links.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 text-sm',
                  active ? 'bg-[var(--majara-red)] text-white' : 'text-white/75 hover:bg-white/10',
                )}
              >
                <Icon size={16} strokeWidth={active ? 2.4 : 1.8} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="flex items-center gap-2 border-t border-white/10 px-5 py-4 text-sm text-white/70 hover:text-white"
          onClick={() => {
            clearToken();
            router.replace('/login');
          }}
        >
          <LogOut size={16} />
          خروج
        </button>
      </aside>
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  );
}
