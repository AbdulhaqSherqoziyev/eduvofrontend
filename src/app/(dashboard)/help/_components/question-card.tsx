'use client';

import Link from 'next/link';
import {
  ArrowRight, ChevronDown, Info, Lightbulb, MessageSquareText, RotateCcw, UserRound,
} from 'lucide-react';
import { NmButton } from '@/components/ui/nm-button';
import { cn } from '@/lib/utils/cn';
import type { QueryUnit } from '@/lib/help/search';
import type { HelpQuestion } from '@/lib/help/types';
import { CopyButton, CopyError, useCopy } from './copy-button';
import { RiskPill, WhoPill } from './risk-pill';
import { Rich, splitFirstSentence } from './rich-text';
import { FOCUS, LABEL, SCROLL_MT, SOFT } from './styles';

export const ADMIN_DOES_IT = 'Bu amalni administrator bajaradi — unga ayting.';

interface QuestionCardProps {
  question: HelpQuestion;
  open: boolean;
  onToggle: () => void;
  highlight: boolean;
  /** Search results show the section name under the title. */
  sectionTitle?: string;
  units?: QueryUnit[];
  /** "Ota-onaga tayyor javob" is for the front desk only (§7.7). */
  showParentReply: boolean;
  /** `canOpen(link)` — false turns the button into the §3.3 sentence. */
  canOpenLink: boolean;
  /** Visible related questions, already resolved to titles. */
  related: { slug: string; title: string }[];
  onGoTo: (slug: string) => void;
}

const HOZIRCHA = /^Hozircha yo'q\s*—\s*/;

/** Note lines -> blocks: "Hozircha yo'q …" lines get their own labelled block (§7.6). */
function noteBlocks(lines: string[]): { kind: 'missing' | 'note'; lines: string[] }[] {
  const out: { kind: 'missing' | 'note'; lines: string[] }[] = [];
  for (const l of lines) {
    if (HOZIRCHA.test(l)) out.push({ kind: 'missing', lines: [l.replace(HOZIRCHA, '')] });
    else if (out.length && out[out.length - 1].kind === 'note') out[out.length - 1].lines.push(l);
    else out.push({ kind: 'note', lines: [l] });
  }
  return out;
}

export function QuestionCard({
  question: q, open, onToggle, highlight, sectionTitle, units, showParentReply, canOpenLink, related, onGoTo,
}: QuestionCardProps) {
  const reply = useCopy();
  const link = useCopy();
  const [first, rest] = splitFirstSentence(q.answer);

  return (
    <div
      id={`q-${q.slug}`}
      className={cn(
        'rounded-[14px] bg-background shadow-nm-sm transition-[box-shadow,background-color] duration-700 motion-reduce:transition-none',
        SCROLL_MT,
        highlight && 'bg-selected ring-2 ring-primary/50',
      )}
    >
      <h3>
        <button
          type="button"
          id={`qb-${q.slug}`}
          aria-expanded={open}
          aria-controls={`qa-${q.slug}`}
          onClick={onToggle}
          className={cn('group flex min-h-[52px] w-full items-start gap-3 rounded-[14px] px-4 py-3 text-left', FOCUS)}
        >
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                'block break-words text-[14.5px] font-bold leading-[1.35]',
                open ? 'text-primary' : 'text-foreground group-hover:text-primary',
              )}
            >
              <Rich text={q.title} units={units} />
            </span>
            {sectionTitle ? (
              <span className={cn('mt-0.5 block text-[12px] font-semibold', SOFT)}>{sectionTitle}</span>
            ) : null}
            {!open && q.risk !== 'safe' ? <RiskPill risk={q.risk} className="mt-2" /> : null}
          </span>
          <ChevronDown
            className={cn('mt-0.5 size-5 shrink-0 transition-transform motion-reduce:transition-none', SOFT, open && 'rotate-180')}
            aria-hidden
          />
        </button>
      </h3>

      {open ? (
        <div id={`qa-${q.slug}`} role="region" aria-labelledby={`qb-${q.slug}`} className="px-4 pb-4 pt-0.5">
          <div className="mb-3 flex flex-wrap gap-2">
            <WhoPill who={q.who} />
            <RiskPill risk={q.risk} />
          </div>

          <p className="text-[14.5px] font-medium leading-[1.6] text-foreground">
            <strong className="font-extrabold">
              <Rich text={first} units={units} />
            </strong>
            {rest ? (
              <>
                {' '}
                <Rich text={rest} units={units} />
              </>
            ) : null}
          </p>

          {q.steps?.length ? (
            <ol className="mt-3.5 flex flex-col gap-2">
              {q.steps.map((s, i) => (
                <li key={i} className="flex items-start gap-3 rounded-[14px] bg-background px-3.5 py-3 shadow-nm-sm">
                  <span
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-grad-primary text-[12.5px] font-extrabold text-white"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 break-words pt-0.5 text-[14px] font-semibold leading-[1.5] text-foreground">
                    <Rich text={s} units={units} />
                  </span>
                </li>
              ))}
            </ol>
          ) : null}

          {q.example ? (
            <div className="mt-3.5 rounded-[16px] bg-background p-4 shadow-nm-inset-sm">
              <div className={cn('mb-1.5 flex items-center gap-1.5', LABEL)}>
                <Lightbulb className="size-4" aria-hidden /> Misol
              </div>
              <p className="whitespace-pre-line break-words text-[14px] font-semibold leading-[1.6] text-foreground tabular-nums">
                <Rich text={q.example} units={units} />
              </p>
            </div>
          ) : null}

          {q.undo ? (
            <p className="mt-3.5 flex items-start gap-2.5 text-[13.5px] font-semibold leading-[1.55] text-foreground">
              <RotateCcw className={cn('mt-0.5 size-4 shrink-0', SOFT)} aria-hidden />
              <span>
                <b className="font-extrabold">Qaytarib bo&apos;ladimi?</b> <Rich text={q.undo} />
              </span>
            </p>
          ) : null}

          {q.note
            ? noteBlocks(q.note).map((b, i) => (
                <div
                  key={i}
                  className="mt-3.5 rounded-[16px] bg-[rgba(232,161,58,0.10)] p-4 dark:bg-[rgba(224,163,60,0.12)]"
                >
                  <div className={cn('mb-1.5 flex items-center gap-1.5', LABEL, 'text-[#7a4e0a] dark:text-[#f0bd5f]')}>
                    <Info className="size-4" aria-hidden />
                    {b.kind === 'missing' ? "Hozircha yo'q — shunday qiling" : 'Eslatma'}
                  </div>
                  {b.lines.map((l, j) => (
                    <p key={j} className="mt-1 break-words text-[13.5px] font-semibold leading-[1.55] text-foreground first:mt-0">
                      <Rich text={l} units={units} />
                    </p>
                  ))}
                </div>
              ))
            : null}

          {showParentReply && q.parentReply ? (
            <div className="mt-3.5 rounded-[16px] border-l-[3px] border-primary bg-background p-4 shadow-nm-sm">
              <div className={cn('flex items-center gap-1.5', LABEL)}>
                <MessageSquareText className="size-4" aria-hidden /> Ota-onaga tayyor javob
              </div>
              <p className={cn('mt-1 text-[12px] font-medium', SOFT)}>
                Telegramga nusxalab yuboring. Qavs ichidagilarni o&apos;zgartiring.
              </p>
              <p
                className={cn(
                  'mt-2.5 whitespace-pre-line break-words text-[14px] font-medium leading-[1.6] text-foreground',
                  reply.state === 'error' && 'select-all',
                )}
              >
                <Rich text={q.parentReply} placeholders />
              </p>
              <div className="mt-3 flex flex-col items-stretch gap-2 sm:items-end">
                <CopyButton kind="text" state={reply.state} onCopy={() => reply.copy(q.parentReply ?? '')} />
                <CopyError state={reply.state} />
              </div>
            </div>
          ) : null}

          {related.length ? (
            <div className="mt-3 flex flex-col items-start sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
              <span className={cn('text-[13px] font-semibold', SOFT)}>Bog&apos;liq:</span>
              {related.map((r) => (
                <button
                  key={r.slug}
                  type="button"
                  onClick={() => onGoTo(r.slug)}
                  className={cn(
                    'inline-flex min-h-[44px] items-center rounded-[6px] text-left text-[13px] font-bold leading-[1.4] text-primary underline-offset-2 hover:underline',
                    FOCUS,
                  )}
                >
                  {r.title}
                  <ArrowRight className="ml-1 size-3.5 shrink-0" aria-hidden />
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-2.5 border-t border-[rgba(163,177,198,0.22)] pt-3.5 dark:border-[rgba(255,255,255,0.06)] sm:flex-row sm:items-center sm:justify-between">
            {q.link ? (
              canOpenLink ? (
                <NmButton asChild variant="soft" size="md" className={cn('h-11 w-full sm:w-auto', FOCUS)}>
                  <Link href={q.link.href}>
                    <ArrowRight className="size-4" aria-hidden />
                    {q.link.label}
                  </Link>
                </NmButton>
              ) : (
                <p className={cn('flex items-start gap-2 text-[13px] font-semibold', SOFT)}>
                  <UserRound className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {ADMIN_DOES_IT}
                </p>
              )
            ) : (
              <span className="hidden sm:block" />
            )}
            <div className="flex flex-col items-stretch gap-1 sm:items-end">
              <CopyButton
                kind="link"
                state={link.state}
                onCopy={() => link.copy(`${window.location.origin}/help#${q.slug}`)}
              />
              <CopyError state={link.state} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
