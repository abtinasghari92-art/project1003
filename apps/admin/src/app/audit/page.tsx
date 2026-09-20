'use client';

import { useEffect, useState } from 'react';
import { AuthGate } from '@/components/auth-gate';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { AdminAuditLog } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AuditPage() { return <AuthGate><Audit /></AuthGate>; }

function Audit() {
  const [rows, setRows] = useState<AdminAuditLog[]>([]);
  const [error, setError] = useState('');
  useEffect(() => { api<AdminAuditLog[]>('/admin/audit-logs').then(setRows).catch((err: unknown) => setError(err instanceof Error ? err.message : 'خطا')); }, []);
  return <div className="space-y-5"><div><p className="text-sm text-[var(--majara-muted)]">ردپای تغییرات حساس</p><h1 className="mt-1 text-2xl font-bold">لاگ فعالیت ادمین</h1></div>{error ? <p className="text-sm text-[var(--majara-red)]">{error}</p> : null}<Card className="overflow-x-auto p-0"><table className="admin-table"><thead><tr><th>ادمین</th><th>عملیات</th><th>موجودیت</th><th>شناسه</th><th>زمان</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.admin.name}<br /><span className="text-xs text-[var(--majara-muted)]">{row.admin.email}</span></td><td>{row.action}</td><td>{row.entityType}</td><td>{row.entityId ?? '—'}</td><td>{formatDate(row.createdAt)}</td></tr>)}{!rows.length ? <tr><td colSpan={5} className="py-8 text-center text-[var(--majara-muted)]">لاگی ثبت نشده</td></tr> : null}</tbody></table></Card></div>;
}
