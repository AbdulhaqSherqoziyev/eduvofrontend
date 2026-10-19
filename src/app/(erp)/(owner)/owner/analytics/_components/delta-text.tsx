import { ArrowDownRight, ArrowUpRight, Minus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { MINUS, fmtAvg } from './format';

export type DeltaTone = 'up-good' | 'up-bad' | 'neutral';

/**
 * Change vs the previous period (spec §1.5). Colour never comes alone: arrow + sign always shown.
 * prev < 20 → absolute ("+2"), else percent ("+12%"); |Δ| < 1% → "o'zgarishsiz".
 */
export function DeltaText({ cur, prev, tone, today }: { cur: number | null; prev: number | null; tone: DeltaTone; today?: boolean }) {
  if (cur === null) return null;
  if (prev === null) return <span className="text-[12px] font-semibold text-muted">Oldingi davr bilan solishtirib bo&apos;lmaydi</span>;

  const suffix = (
    <span className="hidden font-medium text-muted sm:inline"> {today ? 'kechaning shu vaqtiga nisbatan' : "o'tgan davrga nisbatan"}</span>
  );

  if (prev === 0 && cur > 0) {
    return (
      <span className="inline-flex flex-wrap items-center gap-1 text-[12px] font-semibold text-muted">
        <Sparkles className="size-3.5" aria-hidden /> yangi{suffix}
      </span>
    );
  }

  let text: string | null = null;
  const diff = cur - prev;
  if (prev === 0 || diff === 0) text = null;
  else if (prev < 20) text = `${diff > 0 ? '+' : MINUS}${fmtAvg(Math.abs(diff))}`;
  else {
    const pct = (diff / prev) * 100;
    text = Math.abs(pct) < 1 ? null : `${pct > 0 ? '+' : MINUS}${Math.round(Math.abs(pct))}%`;
  }

  if (text === null) {
    return (
      <span className="inline-flex flex-wrap items-center gap-1 text-[12px] font-semibold text-muted">
        <Minus className="size-3.5" aria-hidden /> o&apos;zgarishsiz{suffix}
      </span>
    );
  }

  const up = diff > 0;
  const good = tone === 'neutral' ? null : tone === 'up-good' ? up : !up;
  const color = good === null ? 'text-muted' : good ? 'text-success' : 'text-danger';
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-[12px] font-semibold">
      <span className={cn('inline-flex items-center gap-0.5 font-bold', color)}>
        <Icon className="size-3.5" aria-hidden />{text}
      </span>
      {suffix}
    </span>
  );
}
