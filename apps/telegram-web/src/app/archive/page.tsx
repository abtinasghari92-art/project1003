'use client';

import { useEffect, useState } from 'react';
import type { MagazineDto } from '@majara/types';
import { ArchiveScreen, CATALOG_ISSUES, mergeCatalogWithApi, notifyCartChanged, trackEvent, type CatalogIssue } from '@majara/ui';
import { AppShell } from '@/components/shell';
import { api } from '@/lib/api';
import { CHANNEL } from '@/lib/channel';

export default function ArchivePage() {
  const [issues, setIssues] = useState<CatalogIssue[]>(CATALOG_ISSUES);

  useEffect(() => {
    void api<MagazineDto[]>('/magazines')
      .then((magazines) => setIssues(mergeCatalogWithApi(magazines.flatMap((item) => item.issues))))
      .catch(() => undefined);
  }, []);

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
      <ArchiveScreen issues={issues} onAddToCart={onAddToCart} analyticsChannel="TELEGRAM" />
    </AppShell>
  );
}
