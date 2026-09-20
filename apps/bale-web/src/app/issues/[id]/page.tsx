'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { MagazineDto } from '@majara/types';
import {
  IssueDetailScreen,
  LATEST_ISSUE,
  findCatalogIssue,
  mergeCatalogWithApi,
  notifyCartChanged,
  type CatalogIssue,
} from '@majara/ui';
import { AppShell } from '@/components/shell';
import { api } from '@/lib/api';

export default function IssuePage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';
  const router = useRouter();
  const [issues, setIssues] = useState<CatalogIssue[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void api<MagazineDto[]>('/magazines')
      .then((magazines) => setIssues(mergeCatalogWithApi(magazines.flatMap((item) => item.issues))))
      .catch(() => setIssues([]));
  }, []);

  const issue = useMemo(() => {
    const list = issues ?? [];
    return (
      list.find((item) => item.id === id) ??
      list.find((item) => String(item.number) === id) ??
      findCatalogIssue(id) ??
      LATEST_ISSUE
    );
  }, [issues, id]);

  async function onBuy(quantity: number) {
    setBusy(true);
    try {
      await api('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ issueId: issue.id, qty: quantity }),
      });
      notifyCartChanged();
      router.push('/cart');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <IssueDetailScreen
        issue={issue}
        analyticsChannel="BALE"
        busy={busy}
        onBuy={onBuy}
        onPreview={() => router.push('/preview')}
      />
    </AppShell>
  );
}
