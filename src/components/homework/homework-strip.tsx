'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Circle, Minus, MinusCircle, Send } from 'lucide-react';
import { NmInput } from '@/components/ui/nm-input';
import { StatusPill, type PillTone } from '@/components/shared/status-pill';
import { useSaveMarks } from '@/lib/hooks/use-assignments';
import { cn } from '@/lib/utils/cn';
import { isDoneState, type HomeworkSource, type MarkState, type MarkWrite } from '@/lib/types/homework';

export interface HomeworkStripProps {
  assignmentId: string;
  studentId: string;
  state: MarkState;
  score: number | null;
  /** The assignment's own scale; null = not scored, so no number field at all (§A.4). */
  scoreMax: number | null;
  source?: HomeworkSource | null;
  /** Set from the second teacher correction on — rendered as the §A.6 trace. */
  editedAt?: string | null;
  /** Without `assignment.grade` the strip is read-only: the status word, no buttons. */
  readOnly?: boolean;
  className?: string;
}

type Phase = 'idle' | 'saving' | 'saved' | 'error';

const SAVING_AFTER_MS = 400;
const SAVED_FOR_MS = 2000;
const SCORE_DEBOUNCE_MS = 600;
const REMEMBER_SCORE_MS = 30_000;

const BTN =
  'flex h-[44px] flex-1 items-center justify-center gap-2 rounded-[13px] border-0 bg-background font-sans text-[13.5px] font-bold transition-all nm-pressable';
function btn(active: boolean, activeColor: string) {
  return cn(BTN, active ? `${activeColor} font-extrabold shadow-nm-inset-sm` : 'text-[#9aa6b8] shadow-nm-sm');
}

/** dd.MM for the correction trace. */
function shortDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** §A.9 status table — the state is always a word (plus a glyph), never colour alone. */
export function homeworkPill(
  state: MarkState,
  score: number | null,
  scoreMax: number | null,
): { label: string; tone: PillTone; icon: React.ReactNode } {
  if (isDoneState(state)) {
    const label = score != null && scoreMax != null ? `Bajardi · ${score} / ${scoreMax}` : 'Bajardi';
    return { label, tone: 'success', icon: <Check className="size-3.5" strokeWidth={2.6} /> };
  }
  if (state === 'NOT_DONE') {
    return { label: 'Qilmadi', tone: 'muted', icon: <MinusCircle className="size-3.5" strokeWidth={2.2} /> };
  }
  if (state === 'SUBMITTED') {
    return { label: 'Topshirgan', tone: 'primary', icon: <Send className="size-3.5" strokeWidth={2.2} /> };
  }
  return { label: 'Belgilanmagan', tone: 'muted', icon: <Circle className="size-3.5" strokeWidth={2.2} /> };
}

/**
 * Teacher's homework strip for one student (§A.3/§A.4, used on the detail page §A.9).
 *
 * No "save" button: every tap is one `POST /assignments/:id/marks`; the score
 * field saves on blur, Enter or 600 ms after typing stops. Tapping the active
 * button again clears the mark. "Qilmadi" is never red — the two states differ
 * by shadow, weight and the word itself.
 */
export function HomeworkStrip({
  assignmentId, studentId, state, score, scoreMax, editedAt, readOnly, className,
}: HomeworkStripProps) {
  const { mutate } = useSaveMarks(assignmentId);
  const done = isDoneState(state);
  const notDone = state === 'NOT_DONE';
  const scored = done && scoreMax != null;

  const [phase, setPhase] = useState<Phase>('idle');
  const [draft, setDraft] = useState(score == null ? '' : String(score));
  const [clipNote, setClipNote] = useState<string | null>(null);
  const dirtyRef = useRef(false);
  const scoreRef = useRef(score);
  const seqRef = useRef(0);
  const timers = useRef<{ saving?: number; saved?: number; debounce?: number }>({});
  const remembered = useRef<{ score: number; at: number } | null>(null);

  // Mirror the server value into the field unless the teacher is mid-edit.
  useEffect(() => {
    scoreRef.current = score;
    if (!dirtyRef.current) setDraft(score == null ? '' : String(score));
  }, [score]);

  useEffect(() => {
    const t = timers.current;
    return () => {
      window.clearTimeout(t.saving);
      window.clearTimeout(t.saved);
      window.clearTimeout(t.debounce);
    };
  }, []);

  const commit = (mark: { state: MarkWrite; score?: number | null }) => {
    const seq = ++seqRef.current;
    const t = timers.current;
    window.clearTimeout(t.saving);
    window.clearTimeout(t.saved);
    window.clearTimeout(t.debounce);
    dirtyRef.current = false;
    if (mark.state !== 'DONE') setClipNote(null);
    setPhase('idle');
    // "Saqlanmoqda…" only when the request is noticeably slow (§A.8).
    t.saving = window.setTimeout(() => {
      if (seqRef.current === seq) setPhase('saving');
    }, SAVING_AFTER_MS);
    mutate(
      { marks: [{ studentId, ...mark }] },
      {
        onSuccess: () => {
          if (seqRef.current !== seq) return;
          window.clearTimeout(t.saving);
          setPhase('saved');
          t.saved = window.setTimeout(() => {
            if (seqRef.current === seq) setPhase('idle');
          }, SAVED_FOR_MS);
        },
        onError: () => {
          if (seqRef.current !== seq) return;
          window.clearTimeout(t.saving);
          // The hook already rolled the cache row back; the `score` effect resyncs the field.
          setPhase('error');
        },
      },
    );
  };

  const tapDone = () => {
    if (done) {
      commit({ state: 'CLEAR' });
      return;
    }
    // §A.4: a score dropped by "Qilmadi" less than 30 s ago comes back with "Bajardi".
    const r = remembered.current;
    remembered.current = null;
    const back = r && Date.now() - r.at < REMEMBER_SCORE_MS && scoreMax != null ? Math.min(r.score, scoreMax) : null;
    commit({ state: 'DONE', score: back });
  };

  const tapNotDone = () => {
    if (notDone) {
      commit({ state: 'CLEAR' });
      return;
    }
    if (score != null) remembered.current = { score, at: Date.now() };
    commit({ state: 'NOT_DONE' });
  };

  const commitScore = (raw: string) => {
    window.clearTimeout(timers.current.debounce);
    dirtyRef.current = false;
    const next = raw === '' ? null : Number(raw);
    if (next === scoreRef.current) return;
    commit({ state: 'DONE', score: next });
  };

  const onScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    let next = digits;
    if (digits !== '' && scoreMax != null && Number(digits) > scoreMax) {
      // Clipped, but the note stays until the teacher changes the value again [T9].
      next = String(scoreMax);
      setClipNote(`Eng ko'pi — ${scoreMax}. Siz ${Number(digits)} yozdingiz.`);
    } else {
      setClipNote(null);
    }
    dirtyRef.current = true;
    setDraft(next);
    window.clearTimeout(timers.current.debounce);
    timers.current.debounce = window.setTimeout(() => commitScore(next), SCORE_DEBOUNCE_MS);
  };

  const pill = homeworkPill(state, score, scoreMax);
  const transient =
    phase === 'error'
      ? { text: "Saqlanmadi — qayta urinib ko'ring", cls: 'text-muted', icon: null }
      : phase === 'saving'
        ? { text: 'Saqlanmoqda…', cls: 'text-muted', icon: null }
        : phase === 'saved'
          ? { text: 'Saqlandi', cls: 'text-success', icon: <Check className="size-3.5" strokeWidth={2.6} /> }
          : null;

  return (
    <div className={cn('rounded-[15px] bg-background p-3 shadow-nm-inset-sm', className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.4px] text-muted">Uy vazifasi</span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {transient ? (
            <span className={cn('inline-flex items-center gap-1 text-[11.5px] font-semibold', transient.cls)} role="status">
              {transient.icon}
              {transient.text}
            </span>
          ) : editedAt ? (
            <span className="text-[11.5px] font-semibold text-muted">o&apos;zgartirildi {shortDay(editedAt)}</span>
          ) : null}
          <StatusPill label={pill.label} tone={pill.tone} icon={pill.icon} className="px-2.5 py-[3px] text-[11.5px]" />
        </div>
      </div>

      {readOnly ? null : (
        <>
          <div className="mt-2.5 flex gap-2.5">
            <button type="button" aria-pressed={done} className={btn(done, 'text-success')} onClick={tapDone}>
              <Check className="size-4" strokeWidth={done ? 2.6 : 2.2} /> Bajardi
            </button>
            <button type="button" aria-pressed={notDone} className={btn(notDone, 'text-foreground')} onClick={tapNotDone}>
              {notDone ? <MinusCircle className="size-4" strokeWidth={2.2} /> : <Minus className="size-4" strokeWidth={2.2} />}
              Qilmadi
            </button>
          </div>

          {scored ? (
            <div className="mt-2.5 animate-fadein">
              <div className="flex items-center gap-2">
                <NmInput
                  inputMode="numeric"
                  placeholder="Ball (ixtiyoriy)"
                  aria-label="Ball"
                  className="h-[42px] w-[150px] rounded-[12px] shadow-nm-inset-sm text-[13.5px]"
                  value={draft}
                  onChange={onScoreChange}
                  onBlur={() => commitScore(draft)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
                <span className="text-[13px] font-bold text-muted">/{scoreMax}</span>
              </div>
              {clipNote ? <p className="mt-1.5 text-[11.5px] font-semibold text-muted">{clipNote}</p> : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
