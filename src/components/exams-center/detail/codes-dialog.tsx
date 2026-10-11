'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import type { AccessCode } from '@/lib/api/center-exams';

/** Clipboard with a selectable-text fallback (http / old browsers). */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [done, setDone] = useState<boolean | null>(null);
  const click = async () => {
    const ok = await copyText(text);
    setDone(ok);
    setTimeout(() => setDone(null), 2000);
  };
  return (
    <button
      type="button"
      aria-label={label || 'Nusxalash'}
      onClick={click}
      className="flex h-8 items-center gap-1.5 rounded-[10px] bg-background px-3 text-[12px] font-bold text-primary shadow-nm-sm nm-pressable"
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {done ? 'Nusxalandi' : done === false ? "Qo'lda belgilang" : label ?? 'Nusxalash'}
    </button>
  );
}

interface Props { codes: AccessCode[] | null; examTitle: string; onClose: () => void }

/**
 * Freshly issued access codes (§2.12). The server keeps only a hash, so this
 * dialog is the one and only time they can be read — the copy says so.
 */
export function CodesDialog({ codes, examTitle, onClose }: Props) {
  const all = (codes ?? []).map((c) => `${c.fullName} — ${c.code}`).join('\n');
  return (
    <NmDialog open={!!codes} onOpenChange={(v) => { if (!v) onClose(); }} title="Kirish kodlari" className="max-h-[92vh] overflow-y-auto">
      <div className="flex flex-col gap-4">
        <div className="rounded-[14px] bg-[#FFF1D6] px-4 py-3 text-[12.5px] font-semibold leading-[1.5] text-[#7A4E00]">
          Kodlar faqat hozir ko&apos;rinadi. Oynani yopgandan keyin ularni qayta ko&apos;rib bo&apos;lmaydi — faqat yangisini yaratish mumkin
          (eskisi bekor bo&apos;ladi). Hozir nusxalab oling yoki o&apos;quvchilarga tarqating.
        </div>
        <p className="text-[12.5px] font-semibold text-muted">
          O&apos;quvchi «{examTitle}» imtihoniga kod va o&apos;z familiya-ismi bilan kiradi. Kod tayinlov oynasidan 30 daqiqa oldin ishlay boshlaydi.
        </p>
        <div className="flex max-h-[48vh] flex-col gap-1.5 overflow-y-auto p-1">
          {(codes ?? []).map((c) => (
            <div key={c.studentId} className="flex items-center justify-between gap-3 rounded-[13px] px-3.5 py-2.5 shadow-nm-inset-sm">
              <span className="min-w-0 truncate text-[13.5px] font-bold">{c.fullName}</span>
              <span className="flex items-center gap-2.5">
                <code className="select-all font-mono text-[16px] font-extrabold tracking-[3px] text-foreground">{c.code}</code>
                <CopyButton text={c.code} label="" />
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2.5">
          <CopyButton text={all} label="Hammasini nusxalash" />
          <div className="flex-1" />
          <NmButton variant="soft" size="sm" onClick={onClose}>Yopish</NmButton>
        </div>
      </div>
    </NmDialog>
  );
}
