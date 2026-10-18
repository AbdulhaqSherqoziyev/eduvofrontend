/** Status chip, balance chip, env pill, count badge (Admin Components.dc.html · HOLAT / BALANS CHIPLARI · ENV · BADGE). */
export type Tone = 'ok' | 'ai' | 'warn' | 'err' | 'neutral' | 'muted' | 'blue';

/** Status chip: 12px. ok — To'langan/Faol/Yakunlandi · ai — AI baholamoqda · warn — Tasdiq kutmoqda/Tez kunda/Davom etmoqda ·
 * err — Muvaffaqiyatsiz/Qaytarilgan/Bloklangan · neutral — Muddati o'tdi/Qoralama. */
export function StatusChip({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return <span className={`ma-chip t-${tone}${className ? ` ${className}` : ''}`}>{children}</span>;
}

/** Balance chip: 11px. ok — has credits · muted — 0 · ai — unlimited until a date. */
export function BalanceChip({ tone, children }: { tone: 'ok' | 'muted' | 'ai'; children: React.ReactNode }) {
  return <span className={`ma-chip s-sm t-${tone}`}>{children}</span>;
}

export function EnvPill({ env }: { env: 'PROD' | 'DEV' }) {
  return <span className={`ma-env ${env === 'DEV' ? 'is-dev' : 'is-prod'}`}>{env}</span>;
}

export function CountBadge({ tone = 'warn', children, label }: { tone?: 'warn' | 'blue'; children: React.ReactNode; label?: string }) {
  return <span className={`ma-badge t-${tone}`} aria-label={label}>{children}</span>;
}
