'use client';

import type { ReportLine } from '@/lib/api/owner-exams';

const DOT = { ok: '#1F9D6B', warn: '#D68A1A', error: '#E4574C' } as const;

/** v3 validation report: "fayl.json · N xato" + ok/warn/err dots, path + message. */
export function ImportReport({ name, lines }: { name: string; lines: ReportLine[] }) {
  const errors = lines.filter((l) => l.level === 'error').length;
  const warns = lines.filter((l) => l.level === 'warn').length;
  const sorted = [...lines].sort((a, b) => ['error', 'warn', 'ok'].indexOf(a.level) - ['error', 'warn', 'ok'].indexOf(b.level));
  return (
    <div className="flex flex-col gap-2.5 rounded-[16px] p-4 shadow-nm-inset">
      <div className="flex justify-between gap-3 text-[13.5px] font-extrabold">
        <span className="truncate">{name}</span>
        <span style={{ color: errors ? '#E4574C' : '#1F9D6B' }}>{errors ? `${errors} xato` : 'xatosiz'}{warns ? ` · ${warns} ogohlantirish` : ''}</span>
      </div>
      <div className="flex max-h-[260px] flex-col gap-2 overflow-y-auto pr-1">
        {sorted.map((l, i) => (
          <div key={i} className="flex gap-2.5 text-[13px] leading-[1.45] text-[#3A4658]">
            <span className="mt-[5px] size-2 flex-shrink-0 rounded-full" style={{ background: DOT[l.level] }} aria-label={l.level} />
            <span>{l.path && <code className="mr-1.5 rounded bg-black/5 px-1 text-[11.5px]">{l.path}</code>}{l.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
