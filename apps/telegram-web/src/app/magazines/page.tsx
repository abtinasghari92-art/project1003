'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MagazineDto } from '@majara/types';
import {
  CATALOG_ISSUES,
  StorefrontHome,
  mergeCatalogWithApi,
  notifyCartChanged,
  trackEvent,
  type CatalogIssue,
} from '@majara/ui';
import { AppShell } from '@/components/shell';
import { api } from '@/lib/api';
import { CHANNEL } from '@/lib/channel';

export default function MagazinesPage() {
  const [issues, setIssues] = useState<CatalogIssue[]>(CATALOG_ISSUES);

  useEffect(() => {
    void api<MagazineDto[]>('/magazines')
      .then((magazines) => setIssues(mergeCatalogWithApi(magazines.flatMap((item) => item.issues))))
      .catch(() => undefined);
  }, []);

  const latest = useMemo(() => issues[0] ?? CATALOG_ISSUES[0], [issues]);

  async function onAddToCart(id: string, quantity: number) {
    await api('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ issueId: id, qty: quantity }),
    });
    trackEvent({
      channel: CHANNEL,
      name: 'add_to_cart',
      path: window.location.pathname,
      issueId: id,
      metadata: { qty: quantity },
    });
    notifyCartChanged();
  }

  return (
    <AppShell>
      <StorefrontHome
        latestId={latest.id}
        latestTitle={latest.title}
        latestSummary={latest.summary}
        latestMeta={latest.meta}
        latestIssue={latest.number}
        latestCoverSrc={latest.coverSrc}
        latestPriceRial={latest.priceRial}
        archive={issues}
        onAddToCart={onAddToCart}
        analyticsChannel="TELEGRAM"
      />
    </AppShell>
  );
}
