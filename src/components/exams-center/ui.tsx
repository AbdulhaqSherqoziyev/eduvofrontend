import { cn } from '@/lib/utils/cn';
import type { SectionMethod } from '@/lib/api/center-exams-v3';
import { METHOD, PRESS, SH } from './tokens';

/** Building blocks of the centre console — sizes and colours from design v3. */

/** Screen title row inside `main` (design: 26px/800 title, 14px/500 subtitle, actions right). */
export function ConsoleHeader({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <div className="mb-[22px] flex flex-wrap items-end justify-between gap-5">
      <div className="min-w-0">
        <h1 className="text-[22px] font-extrabold tracking-[-0.6px] text-foreground md:text-[26px]">{title}</h1>
        <p className="mt-1.5 text-[13px] font-medium text-muted md:text-[14px]">{subtitle}</p>
      </div>
      {children ? <div className="flex gap-3">{children}</div> : null}
    </div>
  );
}

export function PrimaryButton({ className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...p}
      className={cn('h-[46px] rounded-[14px] px-[22px] text-[14px] font-bold disabled:cursor-not-allowed disabled:opacity-60', SH.primary, className)}
    />
  );
}

/** Raised neutral button (Batafsil / Tayinlash / Sotib olish …). */
export function SoftButton({ className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...p}
      className={cn('h-[42px] rounded-[13px] bg-background text-[13.5px] disabled:cursor-not-allowed disabled:opacity-60', SH.btn, PRESS, className)}
    />
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-[24px] bg-background', SH.card, className)}>{children}</div>;
}

export function KpiCard({ label, value, sub, accent, size = 28 }: { label: string; value: string; sub?: string; accent?: boolean; size?: 26 | 28 }) {
  return (
    <div className={cn('min-w-0 rounded-[22px] bg-background px-[22px] py-5', SH.card)}>
      <div className="text-[10.5px] font-bold tracking-[0.8px] text-muted">{label}</div>
      <div
        className={cn('mt-2.5 truncate font-extrabold', size === 28 ? 'text-[28px] tracking-[-0.6px]' : 'text-[26px] tracking-[-0.5px]', accent ? 'text-primary' : 'text-foreground')}
      >
        {value}
      </div>
      {sub ? <div className="mt-1 text-[12.5px] font-semibold text-muted">{sub}</div> : null}
    </div>
  );
}

export function KpiGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-[22px] grid grid-cols-2 gap-3.5 md:gap-5 xl:grid-cols-4', className)}>{children}</div>;
}

/** Micro-caps column / field label (10.5px / 700 / #9aa6b8). */
export function Caps({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('text-[10.5px] font-bold tracking-[0.8px] text-[#9aa6b8]', className)}>{children}</div>;
}

export function MethodBadge({ method }: { method: SectionMethod }) {
  const [label, fg, bg] = METHOD[method] ?? METHOD.auto;
  return (
    <span className="whitespace-nowrap rounded-[7px] px-2 py-1 text-[11px] font-extrabold tracking-[0.4px]" style={{ color: fg, background: bg }}>
      {label}
    </span>
  );
}

/** Inset track holding segmented chips (catalogue filter, bank tabs). */
export function ChipTrack({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn('mb-[22px] flex w-max max-w-full gap-1.5 overflow-x-auto rounded-[15px] bg-background p-[5px]', SH.inset)}>
      {children}
    </div>
  );
}

/**
 * Chip button. `track` (filters/tabs): selected = raised RSM, idle = flat.
 * `picker` (assign modal): selected = pressed INSET, idle = raised RSM.
 */
export function ChipButton({
  active, onClick, children, kind = 'track', disabled,
}: { active: boolean; onClick?: () => void; children: React.ReactNode; kind?: 'track' | 'picker'; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'h-9 flex-shrink-0 whitespace-nowrap rounded-[11px] bg-background font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60',
        kind === 'track' ? 'px-4 text-[13.5px]' : 'px-3.5 text-[13px]',
        active ? 'text-primary' : 'text-muted',
        kind === 'track' ? (active ? SH.rsm : '') : active ? SH.inset : SH.rsm,
      )}
    >
      {children}
    </button>
  );
}

/** Status chip with explicit colours (session / job / test pills). */
export function ToneChip({ label, fg, bg, size = 11 }: { label: string; fg: string; bg: string; size?: 10.5 | 11 | 11.5 }) {
  const cls = size === 10.5 ? 'rounded-[7px] px-2 text-[10.5px]' : size === 11.5 ? 'rounded-[8px] px-[9px] text-[11.5px]' : 'rounded-[8px] px-[9px] text-[11px]';
  return (
    <span className={cn('whitespace-nowrap py-1 font-extrabold tracking-[0.4px]', cls)} style={{ color: fg, background: bg }}>
      {label}
    </span>
  );
}

/** "Tez kunda" chip (TOEFL / HSK / CEFR until launch) — design chip palette (amber, as `AUTO + AI`). */
export function SoonChip({ size = 10.5 }: { size?: 10.5 | 11 }) {
  return <ToneChip label="TEZ KUNDA" fg="#7A4E00" bg="#FFF1D6" size={size} />;
}

/** Thin progress bar of the live monitor (track #DDE3EC). */
export function ThinBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 flex-1 rounded-[3px] bg-[#DDE3EC] dark:bg-[#2e343e]">
      <div className="h-full rounded-[3px]" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} />
    </div>
  );
}

/** Inline error line with a retry action (secondary queries inside a screen). */
export function InlineError({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[12.5px] font-bold text-danger">
      {text}
      {onRetry ? <SoftButton className="h-8 px-3 text-[12px] font-bold text-primary" onClick={onRetry}>Qayta urinish</SoftButton> : null}
    </div>
  );
}
