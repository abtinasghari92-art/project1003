'use client';

import { useEffect, useState } from 'react';
import type { MagazineDto } from '@majara/types';
import { ArchiveScreen, CATALOG_ISSUES, mergeCatalogWithApi, notifyCartChanged, type CatalogIssue } from '@majara/ui';
import { AppShell } from '@/components/shell';
import { api } from '@/lib/api';

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
    notifyCartChanged();
  }

  return (
    <AppShell>
      <ArchiveScreen issues={issues} onAddToCart={onAddToCart} analyticsChannel="BALE" />
    </AppShell>
  );
}
