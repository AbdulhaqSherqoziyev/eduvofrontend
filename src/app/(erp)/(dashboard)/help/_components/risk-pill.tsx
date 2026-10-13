import { AlertTriangle, OctagonX, ShieldCheck, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { HelpRisk } from '@/lib/help/types';
import { TONE } from './styles';

const PILL = 'inline-flex items-center gap-1.5 rounded-full px-[11px] py-[5px] text-[12px] font-bold leading-[1.3]';

const RISK: Record<HelpRisk, { label: string; icon: typeof ShieldCheck; tone: string }> = {
  safe: { label: 'Xavfsiz', icon: ShieldCheck, tone: TONE.green },
  careful: { label: "Ehtiyot bo'ling — qaytarsa bo'ladi", icon: AlertTriangle, tone: TONE.yellow },
  irreversible: { label: "Qaytarib bo'lmaydi", icon: OctagonX, tone: TONE.red },
};

/** Risk badge — colour is never alone: text + icon (§7.1). */
export function RiskPill({ risk, className }: { risk: HelpRisk; className?: string }) {
  const r = RISK[risk];
  const Icon = r.icon;
  return (
    <span className={cn(PILL, r.tone, className)}>
      <Icon className="size-4 shrink-0" aria-hidden />
      {r.label}
    </span>
  );
}

/** "Kimning ishi?" pill (§7.1). */
export function WhoPill({ who }: { who: string }) {
  return (
    <span className={cn(PILL, TONE.gray)}>
      <UserRound className="size-4 shrink-0" aria-hidden />
      Kim: {who}
    </span>
  );
}
