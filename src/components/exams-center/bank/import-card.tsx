'use client';

import { useState } from 'react';
import { examsV3Api } from '@/lib/api/center-exams-v3';
import { can } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils/cn';
import { examErrorText } from '../exam-errors';
import { PRESS, SH } from '../tokens';
import { Card } from '../ui';
import type { ImportFlow } from './use-import-flow';

const DOT = { ok: '#1F9D6B', err: '#E4574C', warn: '#D68A1A' } as const;
const ACCEPT = '.json,.xlsx,.xls,audio/*,image/*';
/** Template the "shablonni yuklab olish" link fetches (design has no exam picker here). */
const TEMPLATE_CODE = 'IELTS_ACADEMIC';

/** Import card (design v3 BANK right column): drop zone, check list, review / publish. */
export function ImportCard({ flow: f, inputRef }: { flow: ImportFlow; inputRef: React.RefObject<HTMLInputElement> }) {
  const [over, setOver] = useState(false);
  const [tplError, setTplError] = useState<string | null>(null);
  const manage = can('exam.manage');
  const onFiles = (list: FileList | null) => f.pick(list ? Array.from(list) : []);
  const template = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTplError(null);
    examsV3Api.template(TEMPLATE_CODE).catch((err) => setTplError(examErrorText(err, "Shablonni yuklab bo'lmadi.")));
  };
  return (
    <Card className="flex min-w-0 flex-col gap-4 p-6">
      <div className="text-[16px] font-extrabold">Import</div>
      <input ref={inputRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => { onFiles(e.target.files); e.target.value = ''; }} />
      <div
        role="button"
        tabIndex={0}
        aria-disabled={!manage}
        onClick={() => manage && inputRef.current?.click()}
        onKeyDown={(e) => { if (manage && (e.key === 'Enter' || e.key === ' ')) inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); if (manage) onFiles(e.dataTransfer.files); }}
        className={cn(
          'flex h-[130px] flex-col items-center justify-center gap-1.5 rounded-[18px] border-2 border-dashed px-3 text-center',
          over ? 'border-primary' : 'border-[#C3CDDB] dark:border-[#3a4250]',
          manage ? 'cursor-pointer' : 'cursor-not-allowed opacity-60',
        )}
      >
        <div className="text-[14px] font-bold">JSON yoki Excel faylni tashlang</div>
        <div className="text-[12.5px] font-semibold text-muted">
          + audio va rasmlar · <a href="#" onClick={template} className="text-primary hover:text-[#1F55C4]">shablonni yuklab olish</a>
        </div>
      </div>
      {tplError ? <p className="text-[12px] font-bold text-danger">{tplError}</p> : null}
      <div className={`flex flex-col gap-2.5 rounded-[16px] p-4 ${SH.well}`}>
        <div className="flex justify-between gap-3 text-[13.5px] font-extrabold">
          <span className="truncate">{f.name || 'Fayl tanlanmagan'}</span>
          {f.result ? (
            <span className="whitespace-nowrap" style={{ color: f.result.errors ? '#E4574C' : '#1F9D6B' }}>{f.result.errors} xato</span>
          ) : f.busy ? <span className="text-muted">Tekshirilmoqda…</span> : null}
        </div>
        {f.result?.checks.map((c, i) => (
          <div key={i} className="flex gap-2.5 text-[13px] leading-[1.45] text-[#3A4658] dark:text-foreground">
            <span className="mt-[5px] size-2 flex-shrink-0 rounded-full" style={{ background: DOT[c.level] }} />
            <span>{c.text}</span>
          </div>
        ))}
        {f.files.length > 1 ? <div className="text-[12px] font-semibold text-muted">{f.files.length} ta fayl tanlandi</div> : null}
        {f.error ? <p className="text-[12.5px] font-bold text-danger">{f.error}</p> : null}
        {f.published ? <p className="text-[12.5px] font-bold text-[#1F9D6B]">{f.published} nashr qilindi.</p> : null}
      </div>
      <div className="flex gap-2.5">
        <button
          type="button"
          disabled={!f.files.length || f.busy || !manage}
          onClick={f.check}
          className={`h-[42px] flex-1 rounded-[13px] bg-background text-[13.5px] font-bold disabled:cursor-not-allowed disabled:opacity-60 ${SH.btn} ${PRESS}`}
        >
          Ko&apos;rib chiqish
        </button>
        <button
          type="button"
          disabled={!f.canPublish || !manage}
          onClick={f.publish}
          className={cn(
            'h-[42px] flex-1 rounded-[13px] bg-background text-[13.5px]',
            f.canPublish && manage ? `font-extrabold text-primary ${SH.btn} ${PRESS}` : `cursor-not-allowed font-bold text-[#9aa6b8] ${SH.sunk}`,
          )}
        >
          {f.busy && f.result ? 'Bajarilmoqda…' : 'Nashr qilish'}
        </button>
      </div>
    </Card>
  );
}
