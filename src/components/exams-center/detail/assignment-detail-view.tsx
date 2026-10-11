'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Skeleton } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { useAccessCodes, useDeleteAssignment, useExamAssignment, useExamCatalog, useExamPreview } from '@/lib/hooks/use-center-exams';
import type { AccessCode, AssignmentDetail } from '@/lib/api/center-exams';
import { can } from '@/lib/auth/permissions';
import { examErrorText } from '../exam-errors';
import { LivePanel } from '../live/live-panel';
import { AssignmentHeader } from './assignment-header';
import { CodesDialog } from './codes-dialog';
import { EditAssignmentDialog } from './edit-assignment-dialog';

/** Tayinlov tafsilotlari: summary, live monitor (5 s), access codes, edit, delete. */
export function AssignmentDetailView({ id }: { id: string }) {
  const q = useExamAssignment(id);
  return (
    <QueryBoundary query={q} loading={<div className="flex flex-col gap-5"><Skeleton className="h-[170px]" /><Skeleton className="h-[320px]" /></div>}>
      {(d) => <Detail d={d} />}
    </QueryBoundary>
  );
}

type CodeTarget = { all: true } | { all: false; studentId: string; name: string };

function Detail({ d }: { d: AssignmentDetail }) {
  const a = d.assignment;
  const router = useRouter();
  const exam = useExamCatalog().data?.exams.find((e) => e.code === a.examCode);
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  const [confirmCodes, setConfirmCodes] = useState<CodeTarget | null>(null);
  const [codes, setCodes] = useState<AccessCode[] | null>(null);
  const remove = useDeleteAssignment();
  const issue = useAccessCodes(a.id);
  const preview = useExamPreview();
  const byId = new Map(d.students.map((s) => [s.studentId, s]));

  const generate = (t: CodeTarget) =>
    issue.mutate(t.all ? undefined : [t.studentId], { onSuccess: (c) => { setConfirmCodes(null); setCodes(c); } });
  const askCodes = (t: CodeTarget) => {
    const hasOld = t.all ? d.students.some((s) => s.hasAccessCode) : !!byId.get(t.studentId)?.hasAccessCode;
    issue.reset();
    if (hasOld) setConfirmCodes(t);
    else generate(t);
  };

  return (
    <section className="flex flex-col gap-5">
      <AssignmentHeader
        a={a} exam={exam} previewPending={preview.isPending}
        onPreview={() => preview.open(a.testId, a.mode === 'section' ? a.sectionKey ?? undefined : undefined)}
        onEdit={() => setEdit(true)} onDelete={() => { remove.reset(); setDel(true); }} onCodes={() => askCodes({ all: true })}
      />
      {preview.error ? <p className="text-[12.5px] font-bold text-danger">{examErrorText(preview.error, "Ko'rinishni ochib bo'lmadi.")}</p> : null}
      {issue.error && !confirmCodes ? <p className="text-[12.5px] font-bold text-danger">{examErrorText(issue.error, "Kodlarni yaratib bo'lmadi.")}</p> : null}
      {d.students.length === 0 ? (
        <EmptyState title="Bu tayinlovda o'quvchi yo'q" hint="Guruh bo'sh bo'lgan yoki o'quvchilar o'chirilgan." />
      ) : (
        <LivePanel
          assignment={a}
          exam={exam}
          extra={can('exam.assign') ? {
            head: 'KIRISH KODI',
            cell: (r) => {
              const s = byId.get(r.studentId);
              return (
                <button
                  type="button"
                  disabled={issue.isPending}
                  onClick={() => askCodes({ all: false, studentId: r.studentId, name: r.fullName })}
                  className="h-8 rounded-[10px] bg-background px-3 text-[12px] font-bold text-primary shadow-nm-sm nm-pressable disabled:opacity-50"
                >
                  {s?.hasAccessCode ? 'Yangi kod' : 'Kod berish'}
                </button>
              );
            },
          } : undefined}
        />
      )}
      <EditAssignmentDialog a={a} open={edit} onOpenChange={setEdit} />
      <ConfirmDialog
        open={del}
        onOpenChange={setDel}
        title="Tayinlovni o'chirish"
        message={`«${a.title}» o'chiriladi, o'quvchilar uni ko'rmaydi va kodlar ishlamay qoladi. Imtihonni boshlagan o'quvchi bo'lsa, o'chirib bo'lmaydi.${a.startedCount === 0 ? " Hech kim boshlamagan — kredit yechilmagan." : ''}`}
        confirmLabel="O'chirish"
        pending={remove.isPending}
        error={remove.error ? examErrorText(remove.error) : undefined}
        onConfirm={() => remove.mutate(a.id, { onSuccess: () => { setDel(false); router.push('/exams/assignments'); } })}
      />
      <ConfirmDialog
        open={!!confirmCodes}
        onOpenChange={(v) => { if (!v) setConfirmCodes(null); }}
        title="Yangi kirish kodi"
        message={confirmCodes?.all
          ? "Barcha o'quvchilarga yangi kod yaratiladi. Avval berilgan kodlar darhol bekor bo'ladi."
          : `${confirmCodes && !confirmCodes.all ? confirmCodes.name : ''} uchun yangi kod yaratiladi. Eski kodi darhol bekor bo'ladi.`}
        confirmLabel="Yangi kod yaratish"
        pending={issue.isPending}
        error={issue.error ? examErrorText(issue.error, "Kodlarni yaratib bo'lmadi.") : undefined}
        onConfirm={() => confirmCodes && generate(confirmCodes)}
      />
      <CodesDialog codes={codes} examTitle={a.title} onClose={() => setCodes(null)} />
    </section>
  );
}
