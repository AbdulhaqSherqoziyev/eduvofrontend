'use client';

import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { NmInput } from '@/components/ui/nm-input';
import { NmButton } from '@/components/ui/nm-button';
import { useSubmissions, useGradeSubmission } from '@/lib/hooks/use-assignments';

/** Teacher view: list student submissions for one assignment and grade them. */
export function SubmissionsDialog({ assignmentId, title }: { assignmentId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useSubmissions(assignmentId, open);
  const grade = useGradeSubmission(assignmentId);
  const [scores, setScores] = useState<Record<string, string>>({});

  return (
    <NmDialog
      open={open}
      onOpenChange={setOpen}
      title={`Topshiriqlar — ${title}`}
      trigger={
        <NmIconButton aria-label="Topshiriqlar">
          <ClipboardList className="size-[15px]" strokeWidth={2} />
        </NmIconButton>
      }
    >
      <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-1">
        {isLoading ? <p className="text-[13px] text-muted">Yuklanmoqda...</p> : null}
        {data?.map((s) => {
          const raw = scores[s.submissionId ?? ''] ?? (s.score != null ? String(s.score) : '');
          const parsed = Number(raw);
          const valid = raw.trim() !== '' && Number.isInteger(parsed) && parsed >= 0 && parsed <= 100;
          return (
          <div key={s.studentId} className="rounded-[12px] bg-background px-3 py-2.5 shadow-nm-inset-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-bold text-foreground">{s.studentName}</span>
              <span className={s.submissionId ? 'text-[12px] font-bold text-success' : 'text-[12px] font-bold text-muted'}>
                {s.submissionId ? (s.score != null ? `${s.score} ball` : 'Topshirgan') : 'Topshirmagan'}
              </span>
            </div>
            {s.content ? <p className="mt-1 whitespace-pre-wrap text-[12px] text-muted">{s.content}</p> : null}
            {s.link ? <a href={s.link} target="_blank" rel="noreferrer" className="mt-0.5 block text-[12px] font-semibold text-primary underline">{s.link}</a> : null}
            {s.submissionId ? (
              <div className="mt-2 flex items-center gap-2">
                <NmInput
                  inputMode="numeric"
                  placeholder="Ball (0-100)"
                  className="max-w-[130px]"
                  value={raw}
                  onChange={(e) => setScores({ ...scores, [s.submissionId as string]: e.target.value })}
                />
                <NmButton
                  size="sm"
                  disabled={grade.isPending || !valid}
                  onClick={() => grade.mutate({ submissionId: s.submissionId as string, score: parsed })}
                >
                  Baholash
                </NmButton>
              </div>
            ) : null}
          </div>
          );
        })}
        {data && data.length === 0 ? <p className="text-[13px] text-muted">Guruhда o&apos;quvchi yo&apos;q</p> : null}
      </div>
    </NmDialog>
  );
}
