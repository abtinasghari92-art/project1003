'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { Activity, BarChart3, BookOpen, ClipboardList, LayoutDashboard, LogOut, MessageSquare, ShoppingBag, Tag, Truck, Users } from 'lucide-react';
import { clearToken } from '@/lib/api';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/analytics', label: 'تحلیل و آمار', icon: BarChart3 },
  { href: '/comments', label: 'کامنت‌ها', icon: MessageSquare },
  { href: '/reports', label: 'گزارش‌ها', icon: ClipboardList },
  { href: '/customers', label: 'مشتریان', icon: Users },
  { href: '/orders', label: 'سفارش‌ها', icon: ShoppingBag },
  { href: '/catalog', label: 'کاتالوگ', icon: BookOpen },
  { href: '/promotion', label: 'کد تخفیف', icon: Tag },
  { href: '/delivery', label: 'ارسال و پیک', icon: Truck },
  { href: '/audit', label: 'لاگ فعالیت', icon: Activity },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex min-h-dvh bg-[var(--majara-paper)]">
      <aside className="sticky top-0 flex h-dvh w-16 shrink-0 flex-col bg-[var(--majara-chrome)] text-white md:w-56">
        <Link
          href="/"
          className="border-b border-white/10 px-2 py-5 text-center text-[22px] leading-none text-[var(--majara-red)] md:px-5 md:text-right md:text-[28px]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span className="md:hidden">م</span><span className="hidden md:inline">ماجرا</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 p-1 md:p-3">
          {links.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center justify-center gap-2 px-2 py-2.5 text-sm md:justify-start md:px-3',
                  active ? 'bg-[var(--majara-red)] text-white' : 'text-white/75 hover:bg-white/10',
                )}
              >
                <Icon size={16} strokeWidth={active ? 2.4 : 1.8} />
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="flex items-center justify-center gap-2 border-t border-white/10 px-2 py-4 text-sm text-white/70 hover:text-white md:justify-start md:px-5"
          onClick={() => {
            clearToken();
            router.replace('/login');
          }}
        >
          <LogOut size={16} />
          <span className="hidden md:inline">خروج</span>
        </button>
      </aside>
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  );
}
