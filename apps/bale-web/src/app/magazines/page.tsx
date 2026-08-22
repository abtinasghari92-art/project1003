'use client';

import { useRouter } from 'next/navigation';
import { StorefrontHome } from '@majara/ui';
import { AppShell } from '@/components/shell';
import { api } from '@/lib/api';

export default function MagazinesPage() {
  const router = useRouter();

  return (
    <AppShell>
      <StorefrontHome
        onBuy={async () => {
          try {
            const magazines = await api<{ issues: { id: string }[] }[]>('/magazines');
            const issueId = magazines[0]?.issues?.[0]?.id;
            if (issueId) {
              await api('/cart/items', {
                method: 'POST',
                body: JSON.stringify({ issueId, qty: 1 }),
              });
            }
          } catch {
            /* fixture checkout still works */
          }
          router.push('/checkout');
        }}
        onPreview={() => router.push('/preview')}
        onFavorite={() => router.push('/profile')}
      />
    </AppShell>
  );
}
