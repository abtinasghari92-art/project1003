'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { CartDto } from '@majara/types';
import { AppShell as UiShell, CART_CHANGED_EVENT } from '@majara/ui';
import { api } from '@/lib/api';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  const refresh = useCallback(() => {
    void api<CartDto>('/cart')
      .then((cart) => setCartCount(cart.items.reduce((sum, item) => sum + item.qty, 0)))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(CART_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(CART_CHANGED_EVENT, refresh);
  }, [refresh]);

  return (
    <UiShell pathname={pathname} cartCount={cartCount}>
      {children}
    </UiShell>
  );
}
