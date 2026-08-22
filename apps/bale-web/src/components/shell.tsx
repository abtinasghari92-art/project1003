'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { BookOpen, Eye, Home, Menu, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/magazines', label: 'خانه', icon: Home },
  { href: '/archive', label: 'آرشیو', icon: BookOpen },
  { href: '/preview', label: 'پیش‌نمایش', icon: Eye },
  { href: '/profile', label: 'پروفایل', icon: User },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-[var(--majara-paper)]">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-[var(--majara-chrome)] px-4 py-3 text-white">
        <Link
          href="/magazines"
          className="text-[28px] leading-none text-[var(--majara-red)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ماجرا
        </Link>
        <Link href="/cart" aria-label="منو و سبد" className="text-white">
          <Menu size={22} strokeWidth={2.2} />
        </Link>
      </header>
      <main className="flex-1 px-4 py-5">{children}</main>
      <nav className="sticky bottom-0 z-20 grid grid-cols-4 bg-[var(--majara-chrome)] text-white">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center gap-1 py-2.5 text-[10px]',
                active ? 'text-[var(--majara-red)]' : 'text-white/70',
              )}
            >
              <Icon size={18} strokeWidth={active ? 2.4 : 1.8} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
