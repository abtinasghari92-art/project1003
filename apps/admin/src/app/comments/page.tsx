'use client';

import { useCallback, useEffect, useState } from 'react';
import { AuthGate } from '@/components/auth-gate';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { api } from '@/lib/api';
import type { AdminComment } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const tabs = [
  { key: 'PENDING', label: 'در انتظار' },
  { key: 'APPROVED', label: 'تأییدشده' },
  { key: 'REJECTED', label: 'ردشده' },
];

export default function CommentsPage() { return <AuthGate><Comments /></AuthGate>; }

function Comments() {
  const [status, setStatus] = useState('PENDING');
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<AdminComment[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<Record<string, { body: string; stars: string; reply: string }>>({});
  const [error, setError] = useState('');

  const load = useCallback(async (nextStatus = status) => {
    try { setError(''); setRows(await api<AdminComment[]>(`/admin/comments?status=${nextStatus}${query ? `&q=${encodeURIComponent(query)}` : ''}`)); }
    catch (err) { setError(err instanceof Error ? err.message : 'خطا در دریافت کامنت‌ها'); }
  }, [query, status]);
  useEffect(() => { void load(); }, [load]);

  async function moderate(id: string, next: 'APPROVED' | 'REJECTED') { await api(`/admin/comments/${id}/status?status=${next}`, { method: 'PATCH' }); await load(); }
  async function bulk(next: 'APPROVED' | 'REJECTED') { if (!selected.length) return; await api('/admin/comments/bulk', { method: 'POST', body: JSON.stringify({ ids: selected, status: next }) }); setSelected([]); await load(); }
  async function save(id: string) { const draft = editing[id]; if (!draft) return; await api(`/admin/comments/${id}`, { method: 'PATCH', body: JSON.stringify({ body: draft.body, stars: Number(draft.stars) }) }); if (draft.reply.trim()) await api(`/admin/comments/${id}/reply`, { method: 'POST', body: JSON.stringify({ body: draft.reply }) }); setEditing((current) => { const next = { ...current }; delete next[id]; return next; }); await load(); }

  return <div className="space-y-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-[var(--majara-muted)]">بررسی و پاسخ به نظر خوانندگان</p><h1 className="mt-1 text-2xl font-bold">مدیریت کامنت‌ها</h1></div><form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); void load(); }}><Input placeholder="جستجو در متن یا نام" value={query} onChange={(event) => setQuery(event.target.value)} /><Button type="submit">جستجو</Button></form></div>
    <div className="flex flex-wrap gap-2">{tabs.map((tab) => <Button key={tab.key} variant={status === tab.key ? 'default' : 'outline'} onClick={() => setStatus(tab.key)}>{tab.label}</Button>)}<span className="flex-1" /><Button variant="muted" onClick={() => void bulk('APPROVED')} disabled={!selected.length}>تأیید گروهی</Button><Button variant="outline" onClick={() => void bulk('REJECTED')} disabled={!selected.length}>رد گروهی</Button></div>
    {error ? <p className="text-sm text-[var(--majara-red)]">{error}</p> : null}
    <Card className="overflow-x-auto p-0"><table className="admin-table"><thead><tr><th><input type="checkbox" checked={rows.length > 0 && selected.length === rows.length} onChange={(event) => setSelected(event.target.checked ? rows.map((row) => row.id) : [])} /></th><th>نظر</th><th>شماره</th><th>امتیاز</th><th>ثبت</th><th>عملیات</th></tr></thead><tbody>{rows.map((row) => { const draft = editing[row.id]; return <tr key={row.id} className="align-top"><td><input type="checkbox" checked={selected.includes(row.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id))} /></td><td className="min-w-[280px]"><p className="font-bold">{row.guestName ?? row.user?.telegram?.username ?? row.user?.bale?.username ?? 'کاربر'}</p>{draft ? <><Textarea value={draft.body} onChange={(event) => setEditing({ ...editing, [row.id]: { ...draft, body: event.target.value } })} /><Textarea className="mt-2" placeholder="پاسخ ادمین" value={draft.reply} onChange={(event) => setEditing({ ...editing, [row.id]: { ...draft, reply: event.target.value } })} /></> : <p className="mt-1 leading-6 text-[var(--majara-muted)]">{row.body}</p>}{row.adminReply ? <p className="mt-2 border-r-2 border-[var(--majara-red)] pr-2 text-xs">پاسخ: {row.adminReply}</p> : null}</td><td>شماره {row.issue.number}<br /><span className="text-xs text-[var(--majara-muted)]">{row.issue.title}</span></td><td>{draft ? <Input className="w-20" type="number" min={1} max={5} value={draft.stars} onChange={(event) => setEditing({ ...editing, [row.id]: { ...draft, stars: event.target.value } })} /> : `${row.stars} از ۵`}</td><td className="whitespace-nowrap text-xs">{formatDate(row.createdAt)}</td><td className="whitespace-nowrap">{draft ? <Button size="sm" onClick={() => void save(row.id)}>ذخیره</Button> : <><Button size="sm" onClick={() => void moderate(row.id, 'APPROVED')} disabled={row.status === 'APPROVED'}>تأیید</Button><Button className="mr-2" size="sm" variant="outline" onClick={() => void moderate(row.id, 'REJECTED')} disabled={row.status === 'REJECTED'}>رد</Button><Button className="mr-2" size="sm" variant="muted" onClick={() => setEditing({ ...editing, [row.id]: { body: row.body, stars: String(row.stars), reply: row.adminReply ?? '' } })}>ویرایش</Button></>}</td></tr>; })}{!rows.length ? <tr><td colSpan={6} className="py-10 text-center text-[var(--majara-muted)]">کامنتی در این بخش نیست</td></tr> : null}</tbody></table></Card>
  </div>;
}
