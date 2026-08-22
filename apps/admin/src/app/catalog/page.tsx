'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { AuthGate } from '@/components/auth-gate';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import type { MagazineRow } from '@/lib/types';
import { formatRial } from '@/lib/utils';

const emptyMagazine = { title: '', slug: '', description: '', coverUrl: '' };
const emptyIssue = {
  magazineId: '',
  title: '',
  number: '1',
  priceRial: '',
  coverUrl: '',
  pdfKey: '',
};

export default function CatalogPage() {
  return (
    <AuthGate>
      <Catalog />
    </AuthGate>
  );
}

function Catalog() {
  const [magazines, setMagazines] = useState<MagazineRow[]>([]);
  const [magazineForm, setMagazineForm] = useState(emptyMagazine);
  const [issueForm, setIssueForm] = useState(emptyIssue);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Record<string, { title: string; coverUrl: string; pdfKey: string; priceRial: string }>>(
    {},
  );

  const load = useCallback(async () => {
    setError('');
    try {
      const rows = await api<MagazineRow[]>('/admin/magazines');
      setMagazines(rows);
      setIssueForm((current) => ({
        ...current,
        magazineId: current.magazineId || rows[0]?.id || '',
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createMagazine(event: FormEvent) {
    event.preventDefault();
    try {
      await api('/admin/magazines', {
        method: 'POST',
        body: JSON.stringify({
          title: magazineForm.title,
          slug: magazineForm.slug,
          description: magazineForm.description || undefined,
          coverUrl: magazineForm.coverUrl || undefined,
        }),
      });
      setMagazineForm(emptyMagazine);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا');
    }
  }

  async function createIssue(event: FormEvent) {
    event.preventDefault();
    try {
      await api('/admin/issues', {
        method: 'POST',
        body: JSON.stringify({
          magazineId: issueForm.magazineId,
          title: issueForm.title,
          number: Number(issueForm.number),
          priceRial: Number(issueForm.priceRial),
          coverUrl: issueForm.coverUrl || undefined,
          pdfKey: issueForm.pdfKey || undefined,
        }),
      });
      setIssueForm((current) => ({ ...emptyIssue, magazineId: current.magazineId }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا');
    }
  }

  async function saveIssue(id: string) {
    const draft = editing[id];
    if (!draft) return;
    try {
      await api(`/admin/issues/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: draft.title,
          priceRial: Number(draft.priceRial),
          coverUrl: draft.coverUrl,
          pdfKey: draft.pdfKey,
        }),
      });
      setEditing((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا');
    }
  }

  async function remove(path: string) {
    if (!confirm('حذف شود؟')) return;
    try {
      await api(path, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">کاتالوگ</h1>
      {error ? <p className="text-sm text-[var(--majara-red)]">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-bold">مجله جدید</h2>
          <form className="space-y-3" onSubmit={createMagazine}>
            <Input
              placeholder="عنوان"
              value={magazineForm.title}
              onChange={(e) => setMagazineForm({ ...magazineForm, title: e.target.value })}
              required
            />
            <Input
              placeholder="slug"
              value={magazineForm.slug}
              onChange={(e) => setMagazineForm({ ...magazineForm, slug: e.target.value })}
              required
            />
            <Input
              placeholder="توضیح"
              value={magazineForm.description}
              onChange={(e) => setMagazineForm({ ...magazineForm, description: e.target.value })}
            />
            <Input
              placeholder="URL جلد"
              value={magazineForm.coverUrl}
              onChange={(e) => setMagazineForm({ ...magazineForm, coverUrl: e.target.value })}
            />
            <Button type="submit">ثبت مجله</Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-3 font-bold">شماره جدید</h2>
          <form className="space-y-3" onSubmit={createIssue}>
            <select
              className="h-11 w-full border border-[var(--border)] bg-white px-3 text-sm"
              value={issueForm.magazineId}
              onChange={(e) => setIssueForm({ ...issueForm, magazineId: e.target.value })}
              required
            >
              <option value="">انتخاب مجله</option>
              {magazines.map((magazine) => (
                <option key={magazine.id} value={magazine.id}>
                  {magazine.title}
                </option>
              ))}
            </select>
            <Input
              placeholder="عنوان شماره"
              value={issueForm.title}
              onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
              required
            />
            <Input
              placeholder="شماره"
              type="number"
              min={1}
              value={issueForm.number}
              onChange={(e) => setIssueForm({ ...issueForm, number: e.target.value })}
              required
            />
            <Input
              placeholder="قیمت ریال"
              type="number"
              min={0}
              value={issueForm.priceRial}
              onChange={(e) => setIssueForm({ ...issueForm, priceRial: e.target.value })}
              required
            />
            <Input
              placeholder="URL جلد"
              value={issueForm.coverUrl}
              onChange={(e) => setIssueForm({ ...issueForm, coverUrl: e.target.value })}
            />
            <Input
              placeholder="pdfKey"
              value={issueForm.pdfKey}
              onChange={(e) => setIssueForm({ ...issueForm, pdfKey: e.target.value })}
            />
            <Button type="submit">ثبت شماره</Button>
          </form>
        </Card>
      </div>

      {magazines.map((magazine) => (
        <Card key={magazine.id} className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold">
                {magazine.title}{' '}
                <span className="text-sm font-normal text-[var(--majara-muted)]">/{magazine.slug}</span>
              </h2>
              {magazine.coverUrl ? (
                <p className="text-xs text-[var(--majara-muted)]">{magazine.coverUrl}</p>
              ) : null}
            </div>
            <Button variant="outline" size="sm" onClick={() => void remove(`/admin/magazines/${magazine.id}`)}>
              حذف مجله
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>شماره</th>
                  <th>عنوان</th>
                  <th>قیمت</th>
                  <th>جلد URL</th>
                  <th>pdfKey</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {magazine.issues.map((issue) => {
                  const draft = editing[issue.id];
                  return (
                    <tr key={issue.id}>
                      <td>{issue.number}</td>
                      <td>
                        {draft ? (
                          <Input value={draft.title} onChange={(e) => setEditing({ ...editing, [issue.id]: { ...draft, title: e.target.value } })} />
                        ) : (
                          issue.title
                        )}
                      </td>
                      <td>
                        {draft ? (
                          <Input
                            type="number"
                            value={draft.priceRial}
                            onChange={(e) => setEditing({ ...editing, [issue.id]: { ...draft, priceRial: e.target.value } })}
                          />
                        ) : (
                          formatRial(issue.priceRial)
                        )}
                      </td>
                      <td>
                        {draft ? (
                          <Input
                            value={draft.coverUrl}
                            onChange={(e) => setEditing({ ...editing, [issue.id]: { ...draft, coverUrl: e.target.value } })}
                          />
                        ) : (
                          issue.coverUrl ?? '—'
                        )}
                      </td>
                      <td>
                        {draft ? (
                          <Input
                            value={draft.pdfKey}
                            onChange={(e) => setEditing({ ...editing, [issue.id]: { ...draft, pdfKey: e.target.value } })}
                          />
                        ) : (
                          issue.pdfKey ?? '—'
                        )}
                      </td>
                      <td className="whitespace-nowrap">
                        {draft ? (
                          <Button size="sm" onClick={() => void saveIssue(issue.id)}>
                            ذخیره
                          </Button>
                        ) : (
                          <Button
                            variant="muted"
                            size="sm"
                            onClick={() =>
                              setEditing({
                                ...editing,
                                [issue.id]: {
                                  title: issue.title,
                                  priceRial: String(issue.priceRial),
                                  coverUrl: issue.coverUrl ?? '',
                                  pdfKey: issue.pdfKey ?? '',
                                },
                              })
                            }
                          >
                            ویرایش
                          </Button>
                        )}
                        <Button
                          className="mr-2"
                          variant="outline"
                          size="sm"
                          onClick={() => void remove(`/admin/issues/${issue.id}`)}
                        >
                          حذف
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {magazine.issues.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[var(--majara-muted)]">
                      شماره‌ای نیست
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
}
