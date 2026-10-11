'use client';

import { useState } from 'react';
import { ownerExamsApi, type ConfigRow } from '@/lib/api/owner-exams';
import { errText } from './use-owner-exams';

/** "shablonni yuklab olish": pick an exam → GET templates/:examCode → JSON file download. */
export function TemplateLink({ configs }: { configs: ConfigRow[] }) {
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const get = async (code: string) => {
    setErr(null);
    try {
      const r = await ownerExamsApi.template(code);
      const url = URL.createObjectURL(new Blob([JSON.stringify(r.template, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url; a.download = `${code.toLowerCase()}-shablon.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setOpen(false);
    } catch (e) { setErr(errText(e, "Shablonni yuklab bo'lmadi.")); }
  };
  return (
    <span className="relative" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <button type="button" className="font-semibold text-primary" aria-expanded={open} onClick={() => setOpen((o) => !o)}>shablonni yuklab olish</button>
      {open && (
        <span className="absolute left-1/2 top-6 z-20 flex w-[240px] -translate-x-1/2 flex-col gap-1 rounded-[14px] bg-background p-2 text-left shadow-nm">
          {configs.length === 0 && <span className="px-2 py-1.5 text-[12px] text-muted">Imtihonlar ro&apos;yxati yuklanmoqda…</span>}
          {configs.map((c) => (
            <button key={c.code} type="button" onClick={() => void get(c.code)} className="rounded-[10px] px-2.5 py-2 text-left text-[12.5px] font-bold text-foreground hover:shadow-nm-inset-sm">{c.name}</button>
          ))}
          {err && <span className="px-2 py-1 text-[11.5px] font-semibold text-danger">{err}</span>}
        </span>
      )}
    </span>
  );
}
