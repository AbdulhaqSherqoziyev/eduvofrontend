'use client';

import { NmDialog } from '@/components/ui/nm-dialog';
import { KeyChips } from './key-chips';

/* Import JSON (contract §4) — loose shapes, this is a read-only preview of the file. */
type Q = { no: number; type: string; prompt?: string; answers?: unknown[]; accepted?: string[] };
type G = { layout?: string; instructions?: string; multiGroup?: boolean; questions?: Q[] };
type P = { part: number; title?: string; audio?: string; groups?: G[] };
type St = { key: string; variant?: string | null; parts?: P[]; tasks?: { key: string; prompt?: string; minWords?: number }[]; items?: { itemKey: string; prompt?: string }[] };
type Doc = { exam?: string; title?: string; sections?: { key: string; stages?: St[] }[] };

const ans = (a: unknown[] | undefined) => (a ?? []).map((x) => (typeof x === 'string' ? x : JSON.stringify(x)));

/** "Ko'rib chiqish": section → part → questions, with key and accepted variants. */
export function ImportPreviewDialog({ open, onOpenChange, doc }: { open: boolean; onOpenChange: (o: boolean) => void; doc: unknown }) {
  const d = (doc ?? {}) as Doc;
  return (
    <NmDialog open={open} onOpenChange={onOpenChange} title={d.title ?? 'Test'} className="max-w-[860px]">
      <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
        <div className="text-[12.5px] font-semibold text-muted">{d.exam}</div>
        {(d.sections ?? []).map((s) => (
          <div key={s.key} className="flex flex-col gap-3 rounded-[18px] p-4 shadow-nm-inset-sm">
            <div className="text-[15px] font-extrabold capitalize">{s.key}</div>
            {(s.stages ?? []).map((st) => (
              <div key={`${st.key}-${st.variant ?? ''}`} className="flex flex-col gap-3">
                {st.variant && <div className="text-[12px] font-bold text-muted">Variant: {st.variant}</div>}
                {(st.parts ?? []).map((p) => (
                  <div key={p.part} className="flex flex-col gap-1.5">
                    <div className="text-[13px] font-bold">{p.title ?? `Qism ${p.part}`}{p.audio && <span className="ml-2 text-[11.5px] font-semibold text-muted">♪ {p.audio}</span>}</div>
                    {(p.groups ?? []).flatMap((g) => (g.questions ?? []).map((q) => (
                      <div key={q.no} className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-start gap-2.5 text-[12.5px]">
                        <span className="font-extrabold text-[#5b6b82]">{q.no}</span>
                        <span className="text-foreground">{q.prompt ?? <span className="text-muted">{q.type}</span>} <span className="text-[11px] text-[#9aa6b8]">· {q.type}{g.layout ? ` · ${g.layout}` : ''}</span></span>
                        <KeyChips answers={ans(q.answers)} accepted={q.accepted ?? []} />
                      </div>
                    )))}
                  </div>
                ))}
                {(st.tasks ?? []).map((t) => <div key={t.key} className="text-[12.5px]"><b>{t.key}</b> — {t.prompt?.slice(0, 160)}…</div>)}
                {(st.items ?? []).map((t) => <div key={t.itemKey} className="text-[12.5px]"><b>{t.itemKey}</b> — {t.prompt}</div>)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </NmDialog>
  );
}
