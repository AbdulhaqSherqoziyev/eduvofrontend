import type { CSSProperties, ReactNode } from 'react';
import {
  ArrowDownLeft, ArrowUpRight, Clock, HelpCircle, Landmark, Scale, Undo2, type LucideIcon,
} from 'lucide-react';
import { StatusPill } from '@/components/shared/status-pill';
import { categoryLabel, methodWord, shortDate, SYS_CATEGORY } from '@/lib/utils/tx-display';
import type { Transaction } from '@/lib/types/transaction';

/**
 * How one ledger row presents itself — the single source both the desktop
 * table and the mobile card read from.
 *
 * Colour never carries meaning alone (§0.7): every row states its direction
 * four ways — arrow direction, icon background, the +/− sign and the category
 * word. And an expense is NOT red (§0.8/[SV1]): paying the rent is not a
 * mistake, and a screen where every second row is red teaches the cashier to
 * ignore the colour that marks their actual errors.
 */
export interface RowLook {
  Icon: LucideIcon;
  iconClass: string;
  iconStyle?: CSSProperties;
  sign: '+' | '−';
  amountClass: string;
  struck: boolean;
  pill: ReactNode | null;
  /** Second line under the amount (method, transfer note). */
  amountHint: string;
  /** Status line under the description ("Tasdiq kutilmoqda" explainer). */
  rowHint: string;
  /** Description cell (§A.4). Never carries `#seq` — see [SV5]. */
  title: string;
  /** Second description line. Empty where the server note holds a `#seq`. */
  subtitle: string;
  category: string;
}

const MUTED_ICON = 'shadow-nm-inset-sm text-[#9aa6b8]';
const GREY_TEXT = 'text-[#9aa6b8]';

/** Reason text as the cashier reads it: "Izoh: hujjat yoki chek kerak." */
function reasonLine(tx: Transaction): string {
  const raw = (tx.returnNote || tx.returnReason || '').trim();
  if (!raw) return '';
  const body = raw.charAt(0).toLocaleLowerCase('uz') + raw.slice(1);
  return `Izoh: ${body.endsWith('.') ? body : `${body}.`}`;
}

function base(tx: Transaction): RowLook {
  const category = categoryLabel(tx.category);
  const common = {
    struck: false, pill: null, amountHint: methodWord(tx.method), rowHint: '',
    title: tx.party || '—', subtitle: tx.note, category,
  };

  if (tx.kind === 'TRANSFER') {
    return {
      ...common,
      Icon: Landmark,
      iconClass: 'text-primary',
      iconStyle: { background: 'rgba(46,107,230,0.12)' },
      sign: '−',
      amountClass: 'text-foreground',
      pill: <StatusPill label="Topshirildi" tone="primary" icon={<Landmark className="size-3.5" />} />,
      // Said in words, not in colour: a transfer that merely looks like an
      // expense is exactly the misreading §E.2 exists to prevent.
      amountHint: `${methodWord(tx.method)} · foydaga kirmaydi`,
    };
  }
  if (tx.type === 'INCOME') {
    return {
      ...common,
      Icon: ArrowDownLeft,
      iconClass: 'text-success',
      iconStyle: { background: 'rgba(43,182,115,0.14)' },
      sign: '+',
      amountClass: 'text-success',
    };
  }
  return {
    ...common,
    Icon: ArrowUpRight,
    iconClass: 'shadow-nm-inset-sm text-[#5b6b82]',
    sign: '−',
    amountClass: 'text-foreground',
  };
}

/** Grey it out without hiding it — `opacity-45` made the text unreadable. */
function fade(look: RowLook, rowHint: string, struck = true): RowLook {
  return { ...look, iconClass: MUTED_ICON, iconStyle: undefined, amountClass: GREY_TEXT, struck, rowHint };
}

export function rowLook(tx: Transaction): RowLook {
  const look = base(tx);

  if (look.category === SYS_CATEGORY.DAY_DIFF) {
    return {
      ...look,
      Icon: Scale,
      iconClass: MUTED_ICON,
      iconStyle: undefined,
      amountClass: 'text-foreground',
      pill: <StatusPill label="Kun yakuni" tone="muted" />,
      title: tx.note ? `Sabab: ${tx.note.toLocaleLowerCase('uz')}` : 'Kassa farqi',
      subtitle: '',
      rowHint: '',
    };
  }
  if (tx.reversalOf) {
    return {
      ...fade(look, '', false),
      Icon: Undo2,
      // [SV5]: no "#131" anywhere on this row — and the server's own note
      // ("#35 yozuvini to'g'rilaydi") is dropped for the same reason. A number
      // the cashier cannot find in the list reads as something being kept from
      // them; the real link lives in the detail dialog (§A.7).
      title: "Oldingi yozuvni to'g'rilaydi",
      subtitle: '',
      category: SYS_CATEGORY.CORRECTION,
    };
  }
  if (tx.status === 'PENDING') {
    return {
      ...fade(look, "Kassa qoldig'iga hali ta'sir qilmagan.", false),
      pill: <StatusPill label="Tasdiq kutilmoqda" tone="warning" icon={<Clock className="size-3.5" />} />,
    };
  }
  if (tx.status === 'RETURNED') {
    return {
      ...fade(look, reasonLine(tx), false),
      pill: <StatusPill label="Aniqlik kutilmoqda" tone="warning" icon={<HelpCircle className="size-3.5" />} />,
    };
  }
  if (tx.status === 'WITHDRAWN') return fade(look, `Qaytarib olindi · ${shortDate(tx.date)}`);
  if (tx.voided) {
    const word = tx.studentId ? 'Qaytarilgan' : "To'g'rilangan";
    // The date the correction was made, not this row's own: a rent entry
    // written on the 9th and corrected on the 16th used to stamp itself
    // "To'g'rilangan · 09.08", which reads as corrected the day it was written.
    return fade(look, `${word} · ${shortDate(tx.related?.date ?? tx.date)}`);
  }
  return look;
}
