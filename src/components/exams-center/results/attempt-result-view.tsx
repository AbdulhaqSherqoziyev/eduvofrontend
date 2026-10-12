'use client';
/**
 * Staff full result `/exams/results/[attemptId]` (Abdulhaq 10-12: "hamma narsani detal").
 * Reuses the student result pieces: dark overall card (`OverallBlock`), hub `ScoreCard`,
 * "Xulosa" (`ResultSummary`), hub `ReviewRow` (explanation + evidence) and `AiTaskPanel`.
 * Staff-only on top: essay text, time per section, integrity warnings, "Chop etish" (print CSS).
 * Scores are shown as plain numbers — no "estimated" wording.
 */
import { AlertTriangle, ArrowLeft, Clock, Printer, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { OverallBlock } from '@/components/exam/results/OverallBlock';
import { PassageModal } from '@/components/exam/results/PassageModal';
import { ResultSummary } from '@/components/exam/results/ResultSummary';
import { AiTaskPanel } from '@/components/exams-hub/ai-task-panel';
import { ReviewRow } from '@/components/exams-hub/review-row';
import { ScoreCard } from '@/components/exams-hub/score-card';
import { ErrorCard } from '@/components/shared/error-card';
import { RowsSkeleton, Skeleton } from '@/components/shared/skeleton';
import type { StaffAttemptResult } from '@/lib/api/center-exams';
import type { ExamFamily } from '@/lib/exam/hub-types';
import { t } from '@/lib/exam/i18n';
import { buildSummary } from '@/lib/exam/result-summary';
import type { ResultSection } from '@/lib/exam/types';
import { useExamAttemptResult } from '@/lib/hooks/use-center-exams';
import { cn } from '@/lib/utils/cn';
import { examErrorCode } from '../exam-errors';
import { dateTimeLabel } from '../exam-meta';
import { SH } from '../tokens';
import { Caps, Card, ChipButton, ChipTrack, SoftButton } from '../ui';
import { durationText, essaysFor, eventLabel, integrityOf, timingOf, type StageTime } from './staff-result';

const familyOf = (code: string): ExamFamily =>
  code.startsWith('CEFR') ? 'CEFR' : code.startsWith('SAT') ? 'SAT' : code.startsWith('TOEFL') ? 'TOEFL' : code.startsWith('HSK') ? 'HSK' : 'IELTS';
const isAi = (k: string) => k === 'writing' || k === 'speaking';
// ResultSummary / OverallBlock read these in the console's dark theme.
const RS_VARS = 'dark:[--rs-ink:#E6EBF2] dark:[--rs-sub:#AAB4C3] dark:[--rs-muted:#8C97A8] dark:[--rs-track:#2e343e]';

const PRINT_CSS = `@media print{
  @page{margin:14mm}
  body *{visibility:hidden}
  [data-print-root],[data-print-root] *{visibility:visible}
  [data-print-root]{position:absolute;left:0;top:0;width:100%}
  .h-screen,main{height:auto!important;overflow:visible!important}
  [data-print-hide],.print-hide{display:none!important}
  [data-print-root] *{box-shadow:none!important}
  [data-print-root] [data-print-card],[data-print-root] .print-card{border:1px solid #DDE3EC}
  [data-print-root] [data-print-card]{break-inside:avoid}
  [data-print-root] .xr-dark{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}`;

function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-[60px] w-full max-w-[420px]" />
      <div className="grid gap-4 md:grid-cols-[300px_minmax(0,1fr)]"><Skeleton className="h-[180px] w-full" /><Skeleton className="h-[180px] w-full" /></div>
      <RowsSkeleton rows={6} />
    </div>
  );
}

function Back() {
  return (
    <Link href="/exams/results" data-print-hide className="inline-flex items-center gap-1.5 self-start text-[13.5px] font-bold text-[#5b6b82] hover:text-primary">
      <ArrowLeft className="size-4" aria-hidden />Natijalar
    </Link>
  );
}

export function AttemptResultView({ id }: { id: string }) {
  const q = useExamAttemptResult(id);
  if (q.isLoading) return <section className="flex flex-col gap-4 pb-6"><Back /><Loading /></section>;
  if (q.isError || !q.data) {
    const code = q.isError ? examErrorCode(q.error) : null;
    const msg = code === 'ATTEMPT_NOT_FINISHED' ? 'Urinish hali tugamagan — natija yakunlangach shu yerda chiqadi.' : code === 'NOT_FOUND' || code === 'ATTEMPT_NOT_FOUND' ? 'Natija topilmadi.' : null;
    return (
      <section className="flex flex-col gap-4 pb-6">
        <Back />
        {msg ? <Card className="p-6 text-[14px] font-semibold text-[#5b6b82]">{msg}</Card> : <ErrorCard onRetry={() => void q.refetch()} />}
      </section>
    );
  }
  return <Detail r={q.data} />;
}

function Detail({ r }: { r: StaffAttemptResult }) {
  const family = familyOf(r.examCode);
  const sections = r.sections.filter((s) => s.status !== 'NOT_TAKEN');
  const summary = useMemo(() => buildSummary(r), [r]);
  const timing = useMemo(() => timingOf(r), [r]);
  const events = useMemo(() => integrityOf(r), [r]);
  const [anchor, setAnchor] = useState<{ a: string; s: string } | null>(null);
  const name = r.isPreview ? `Sinov urinishi${r.previewBy?.fullName ? ` · ${r.previewBy.fullName}` : ''}` : r.student?.fullName ?? '—';
  const when = r.finishedAt ?? r.startedAt ?? null;
  const sub = [
    r.examName ?? r.examCode,
    r.test?.title,
    r.student?.group?.name,
    r.assignment?.title ? `Tayinlov: ${r.assignment.title}` : null,
    when ? dateTimeLabel(when) : null,
  ].filter(Boolean).join(' · ');
  const timeFor = (s: ResultSection) => timing.find((x) => x.key === s.key || x.sectionKey === s.key || (s.key && x.key.startsWith(`${s.key}_`)));

  return (
    <section data-print-root className={cn('flex flex-col gap-5 pb-8', RS_VARS)}>
      <style>{PRINT_CSS}</style>
      <Back />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[22px] font-extrabold tracking-[-0.6px] text-foreground md:text-[26px]">{name}</h1>
            {r.isPreview ? <span className="rounded-[7px] bg-[#FFF1D6] px-2 py-0.5 text-[10.5px] font-extrabold tracking-[0.4px] text-[#7A4E00]">SINOV</span> : null}
          </div>
          <p className="mt-1.5 text-[13px] font-medium text-muted md:text-[14px]">{sub}</p>
        </div>
        <SoftButton className="print-hide inline-flex items-center gap-2 px-4 text-[13px] font-bold text-primary" onClick={() => window.print()}>
          <Printer className="size-4" aria-hidden />Chop etish
        </SoftButton>
      </div>

      {sections.length === 0 ? (
        <Card className="p-6 text-[14px] font-semibold text-[#5b6b82]">Bu urinishda topshirilgan bo&apos;lim yo&apos;q.</Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-[300px_minmax(0,1fr)]">
          <div data-print-card className="xr-dark flex min-h-[180px] flex-col justify-center rounded-[24px] bg-[#1E2A3A] p-6 text-white">
            <OverallBlock r={r} locale="uz" fallbackTitle={`${sections.length} ta bo'lim natijasi`} />
          </div>
          <div className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
            {sections.map((s) => (
              <ScoreCard key={s.key} s={s} family={family} cert={r.certificate} selected={false} onSelect={() => document.getElementById(`sec-${s.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />
            ))}
          </div>
        </div>
      )}

      {summary.sections.length || summary.nextSteps.length ? (
        <Card className="print-card p-6 max-md:p-4"><ResultSummary data={summary} locale="uz" /></Card>
      ) : null}

      {sections.map((s) => (isAi(s.key) ? (
        <AiSection key={s.key} r={r} s={s} family={family} time={timeFor(s)} />
      ) : (
        <ObjectiveSection key={s.key} r={r} s={s} time={timeFor(s)} onPassage={r.passages?.length ? (a) => setAnchor({ a, s: s.key }) : undefined} />
      )))}

      <IntegrityCard events={events} sections={r.sections} />
      <div className="text-center text-[12px] font-semibold text-[#9aa6b8]">{t('results.disclaimer', 'uz')}</div>
      {anchor ? <PassageModal anchor={anchor.a} sectionKey={anchor.s} passages={r.passages} locale="uz" onClose={() => setAnchor(null)} /> : null}
    </section>
  );
}

function TimeLine({ time }: { time?: StageTime }) {
  if (!time || time.usedSec == null) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted">
      <Clock className="size-3.5" aria-hidden />
      {durationText(time.usedSec)}{time.limitSec ? ` · ${Math.round(time.limitSec / 60)} daqiqadan` : ''}
    </span>
  );
}

function SectionHead({ s, time, children }: { s: ResultSection; time?: StageTime; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <h2 className="text-[17px] font-extrabold text-foreground">{s.title}</h2>
          {s.label ? <span className="text-[17px] font-extrabold tabular-nums text-primary">{s.label}</span> : null}
          {s.level ? <span className={`rounded-[8px] px-[9px] py-0.5 text-[12px] font-extrabold text-[#5b6b82] ${SH.chip}`}>{s.level}</span> : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
          {s.raw != null && s.max != null ? <span className="text-[13px] font-semibold text-muted">{s.max} tadan {s.raw} ta to&apos;g&apos;ri</span> : null}
          <TimeLine time={time} />
        </div>
      </div>
      {children}
    </div>
  );
}

type Filter = 'all' | 'wrong';

function ObjectiveSection({ r, s, time, onPassage }: { r: StaffAttemptResult; s: ResultSection; time?: StageTime; onPassage?: (a: string) => void }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState(false);
  const sat = r.examCode.startsWith('SAT');
  const rows = r.review.filter((x) => x.sectionKey === s.key).map((x, i) => (sat && !x.stageKey ? { ...x, no: i + 1 } : x));
  const wrong = rows.filter((x) => !x.isCorrect);
  const list = filter === 'wrong' ? wrong : rows;
  return (
    <Card className="print-card flex scroll-mt-4 flex-col gap-4 p-6 max-md:p-4">
      <div id={`sec-${s.key}`} />
      <SectionHead s={s} time={time} />
      {s.status !== 'READY' ? (
        <div className="text-[14px] font-semibold text-muted">{s.status === 'NEEDS_HUMAN' ? t('results.human_review', 'uz') : 'Baholanmoqda…'}</div>
      ) : !rows.length ? (
        <div className="text-[14px] font-semibold text-muted">Bu bo&apos;lim bo&apos;yicha savollar ro&apos;yxati yo&apos;q.</div>
      ) : (
        <>
          <div data-print-hide className="flex flex-wrap items-center gap-3">
            <ChipTrack>
              <ChipButton active={filter === 'all'} onClick={() => setFilter('all')}>Hammasi · {rows.length}</ChipButton>
              <ChipButton active={filter === 'wrong'} onClick={() => setFilter('wrong')}>Faqat xatolar · {wrong.length}</ChipButton>
            </ChipTrack>
            <SoftButton className="mb-[22px] h-9 px-3.5 text-[12.5px] font-bold text-primary" onClick={() => setExpanded((e) => !e)}>
              {expanded ? 'Izohlarni yopish' : 'Hamma izohlarni ochish'}
            </SoftButton>
          </div>
          {list.length ? (
            <div className="grid gap-2.5 lg:grid-cols-2">
              {list.map((x) => <ReviewRow key={`${x.questionId}-${expanded ? 1 : 0}`} r={x} onPassage={onPassage} defaultOpen={expanded} />)}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[13.5px] font-semibold text-muted"><ShieldCheck className="size-4 text-[#1F7A55]" aria-hidden />Bu bo&apos;limda hamma javob to&apos;g&apos;ri.</div>
          )}
        </>
      )}
    </Card>
  );
}

function AiSection({ r, s, family, time }: { r: StaffAttemptResult; s: ResultSection; family: ExamFamily; time?: StageTime }) {
  const essays = essaysFor(r, s.key);
  return (
    <Card className="print-card flex scroll-mt-4 flex-col gap-4 p-6 max-md:p-4">
      <div id={`sec-${s.key}`} />
      <SectionHead s={s} time={time} />
      {essays.length ? (
        <div className="flex flex-col gap-3">
          {essays.map((e, i) => (
            <div key={e.taskKey} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Caps>{i + 1}-TOPSHIRIQ · {s.key === 'speaking' ? 'NUTQ MATNI (STT)' : <>O&apos;QUVCHI MATNI</>}</Caps>
                {e.words != null ? <span className="text-[12px] font-bold text-muted">{e.words} so&apos;z{e.minWords ? ` · kamida ${e.minWords}` : ''}</span> : null}
              </div>
              {e.prompt ? <p className="text-[13px] font-medium leading-[1.55] text-[#5b6b82]">{e.prompt}</p> : null}
              <div className={`whitespace-pre-wrap rounded-[16px] p-4 text-[15px] leading-[1.75] text-foreground ${SH.well}`} style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                {e.text ?? <span className="italic text-muted">{t('results.no_response', 'uz')}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <AiTaskPanel r={r} family={family} />
    </Card>
  );
}

function IntegrityCard({ events, sections }: { events: ReturnType<typeof integrityOf>; sections: ResultSection[] }) {
  const title = (k: string | null) => (k ? sections.find((s) => s.key === k || k.startsWith(`${s.key}_`))?.title ?? k : null);
  const counts = events.reduce<Record<string, number>>((m, e) => ({ ...m, [e.type]: (m[e.type] ?? 0) + 1 }), {});
  return (
    <Card className="print-card flex flex-col gap-3 p-6 max-md:p-4">
      <h2 className="text-[17px] font-extrabold text-foreground">Ogohlantirishlar</h2>
      {!events.length ? (
        <div className="flex items-center gap-2 text-[13.5px] font-semibold text-muted"><ShieldCheck className="size-4 text-[#1F7A55]" aria-hidden />Imtihon davomida ogohlantirish qayd etilmadi.</div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {Object.entries(counts).map(([k, n]) => (
              <span key={k} className="rounded-[9px] bg-[#FFF1D6] px-2.5 py-1 text-[12px] font-bold text-[#7A4E00]">{eventLabel(k)} · {n}</span>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            {events.map((e, i) => (
              <div key={i} className={`grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-[12px] px-3 py-2 text-[13px] ${SH.row}`}>
                <span className="inline-flex items-center gap-1.5 font-bold tabular-nums text-[#5b6b82]">
                  <AlertTriangle className="size-3.5 text-[#B7790F]" aria-hidden />{e.at ? new Date(e.at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : '—'}
                </span>
                <span className="min-w-0 font-semibold text-foreground">
                  {eventLabel(e.type)}{title(e.stage) ? <span className="text-muted"> · {title(e.stage)}</span> : null}
                  {e.detail ? <span className="block truncate text-[12px] font-medium text-muted">{e.detail}</span> : null}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
