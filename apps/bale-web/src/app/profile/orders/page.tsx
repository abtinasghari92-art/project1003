'use client';

import { OrderHistoryScreen } from '@majara/ui';
import { AppShell } from '@/components/shell';
import { api } from '@/lib/api';

export default function OrdersPage() {
  return <AppShell><OrderHistoryScreen request={api} /></AppShell>;
}
