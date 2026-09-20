'use client';

import { AddressesScreen } from '@majara/ui';
import { AppShell } from '@/components/shell';
import { api } from '@/lib/api';

export default function AddressesPage() {
  return <AppShell><AddressesScreen request={api} /></AppShell>;
}
