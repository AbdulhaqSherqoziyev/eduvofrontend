'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { NmButton } from '@/components/ui/nm-button';
import { useMutation } from '@tanstack/react-query';
import { ownerExamsApi, statusLabel } from '@/lib/api/owner-exams';
import { TestTree } from '../_components/test-tree';
import { errText, useBankTest, usePublishTest, useUnpublishTest } from '../_components/use-owner-exams';

/** Test detail: tree with answer keys, inline key/accepted editing, publish state. */
export default function OwnerTestPage() {
  const { testId } = useParams<{ testId: string }>();
  const q = useBankTest(testId);
  const publish = usePublishTest();
  const unpublish = useUnpublishTest();
  const t = q.data;
  const preview = useMutation({ mutationFn: () => ownerExamsApi.preview(testId) });
  /** The tab is opened synchronously (popup blockers), then pointed at the preview attempt. */
  const openPreview = () => {
    const tab = window.open('about:blank', '_blank');
    preview.mutate(undefined, {
      onSuccess: (r) => { if (tab) tab.location.href = `/exam/${encodeURIComponent(r.attemptId)}?preview=${encodeURIComponent(r.token)}`; },
      onError: () => tab?.close(),
    });
  };
  const err = publish.error ?? unpublish.error ?? preview.error;
  const count = t?.stages.reduce((a, s) => a + s.parts.reduce((b, p) => b + p.groups.reduce((c, g) => c + g.questions.length, 0), 0), 0) ?? 0;
  return (
    <section className="flex flex-col gap-5">
      <Link href="/owner/exams" className="text-[13px] font-bold text-primary">← Test banki</Link>
      {q.isLoading && <div className="h-[200px] animate-pulse rounded-[24px] shadow-nm" />}
      {q.isError && <div className="text-[14px] font-semibold text-muted">Testni yuklab bo&apos;lmadi. <button type="button" className="font-bold text-primary" onClick={() => void q.refetch()}>Qayta urinish</button></div>}
      {t && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-[24px] font-extrabold tracking-[-0.4px] text-foreground">{t.title}</h1>
              <p className="text-[14px] text-muted">{t.examCode} · config {t.configVersion} · {count} ta savol · {statusLabel(t.status)}</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <NmButton variant="soft" disabled={preview.isPending} onClick={openPreview}>{preview.isPending ? 'Ochilmoqda…' : <>O&apos;quvchi ko&apos;rinishida ochish</>}</NmButton>
              {t.status === 'PUBLISHED'
                ? <NmButton variant="soft" disabled={unpublish.isPending} onClick={() => unpublish.mutate(t.id)}>Nashrdan olish</NmButton>
                : <NmButton disabled={publish.isPending} onClick={() => publish.mutate(t.id)}>{publish.isPending ? 'Nashr qilinmoqda…' : 'Nashr qilish'}</NmButton>}
            </div>
          </div>
          {err && <div className="text-[13px] font-semibold text-danger">{errText(err)}</div>}
          <TestTree test={t} />
        </>
      )}
    </section>
  );
}
