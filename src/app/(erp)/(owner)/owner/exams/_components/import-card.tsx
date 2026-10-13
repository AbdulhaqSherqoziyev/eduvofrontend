'use client';

import { useImperativeHandle, useRef, useState, type MutableRefObject } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { NmButton } from '@/components/ui/nm-button';
import { ownerExamsApi, type ConfigRow, type ImportResult } from '@/lib/api/owner-exams';
import { ImportPreviewDialog } from './import-preview';
import { ImportReport } from './import-report';
import { TemplateLink } from './template-link';
import { errText } from './use-owner-exams';

type Phase = 'idle' | 'checking' | 'checked' | 'publishing' | 'done';

/**
 * v3 Import card: dropzone (JSON + audio/images; Excel shown, "tez orada"),
 * template link, dry-run report, "Ko'rib chiqish" preview, "Nashr qilish"
 * (= real import + publish, disabled while the report has errors).
 */
export function ImportCard({ configs, apiRef }: { configs: ConfigRow[]; apiRef: MutableRefObject<{ pick: () => void } | null> }) {
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [doc, setDoc] = useState<unknown>(null);
  const [res, setRes] = useState<ImportResult | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [msg, setMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [drag, setDrag] = useState(false);
  useImperativeHandle(apiRef, () => ({ pick: () => input.current?.click() }), []);

  const json = files.find((f) => f.name.toLowerCase().endsWith('.json'));
  const errors = res?.report.filter((l) => l.level === 'error').length ?? 0;
  const form = () => { const fd = new FormData(); files.forEach((f) => fd.append('files', f, f.name)); return fd; };

  const take = async (list: FileList | File[]) => {
    const arr = Array.from(list);
    const excel = arr.some((f) => /\.xlsx?$/i.test(f.name));
    const next = arr.filter((f) => !/\.xlsx?$/i.test(f.name));
    setMsg(excel ? "Excel import tez orada qo'shiladi — hozircha JSON shablon ishlating." : null);
    setRes(null); setDoc(null); setFiles(next);
    const j = next.find((f) => f.name.toLowerCase().endsWith('.json'));
    if (!j) { if (next.length) setMsg('Test JSON fayli kerak (audio va rasmlar u bilan birga tashlanadi).'); setPhase('idle'); return; }
    try { setDoc(JSON.parse(await j.text())); } catch { setMsg(`${j.name} — JSON formatida emas.`); setPhase('idle'); return; }
    setPhase('checking');
    try {
      const fd = new FormData(); next.forEach((f) => fd.append('files', f, f.name));
      setRes(await ownerExamsApi.importTest(fd, true)); setPhase('checked');
    } catch (e) { setMsg(errText(e, "Tekshiruv bajarilmadi — internet yoki serverni tekshiring.")); setPhase('idle'); }
  };

  const publish = async () => {
    setPhase('publishing'); setMsg(null);
    try {
      const r = await ownerExamsApi.importTest(form(), false);
      setRes(r);
      if (!r.ok || !r.testId) { setPhase('checked'); return; }
      const p = await ownerExamsApi.publish(r.testId).catch((e) => { throw e; });
      void qc.invalidateQueries({ queryKey: ['owner-exams'] });
      setMsg(p.ok ? 'Test nashr qilindi va ro\'yxatga qo\'shildi.' : 'Test qoralama sifatida saqlandi — nashrdagi xatolarni test sahifasida ko\'ring.');
      setPhase('done'); setFiles([]); setDoc(null);
    } catch (e) { setMsg(errText(e)); setPhase('checked'); }
  };

  return (
    <div className="flex flex-col gap-4 rounded-[24px] bg-background p-6 shadow-nm">
      <div className="text-[16px] font-extrabold">Import</div>
      <input ref={input} type="file" multiple hidden accept=".json,.xlsx,.xls,audio/*,image/*" onChange={(e) => e.target.files && void take(e.target.files)} />
      <div role="button" tabIndex={0} onClick={() => input.current?.click()} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); void take(e.dataTransfer.files); }}
        className="flex h-[130px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[18px] border-2 border-dashed text-center"
        style={{ borderColor: drag ? '#2E6BE6' : '#C3CDDB' }}>
        <div className="text-[14px] font-bold">JSON yoki Excel faylni tashlang</div>
        <div className="text-[12.5px] font-semibold text-muted">+ audio va rasmlar · <TemplateLink configs={configs} /></div>
        <div className="text-[11px] font-semibold text-[#9aa6b8]">Excel — tez orada</div>
      </div>
      {files.length > 0 && <div className="text-[12px] font-semibold text-muted">{files.length} ta fayl: {files.map((f) => f.name).slice(0, 4).join(', ')}{files.length > 4 ? '…' : ''}</div>}
      {phase === 'checking' && <div className="text-[13px] font-semibold text-muted">Tekshirilmoqda… (audio yuklanmoqda)</div>}
      {res && <ImportReport name={json?.name ?? 'test.json'} lines={res.report} />}
      {msg && <div className="text-[12.5px] font-semibold" style={{ color: phase === 'done' ? '#1F9D6B' : '#7A5A12' }}>{msg}</div>}
      <div className="flex gap-2.5">
        <NmButton variant="soft" className="flex-1 text-foreground" disabled={!doc} onClick={() => setPreview(true)}>Ko&apos;rib chiqish</NmButton>
        <NmButton variant={errors || !res ? 'soft' : 'primary'} className="flex-1" disabled={!res || errors > 0 || phase === 'publishing' || phase === 'checking'} onClick={() => void publish()}>
          {phase === 'publishing' ? 'Nashr qilinmoqda…' : 'Nashr qilish'}
        </NmButton>
      </div>
      <ImportPreviewDialog open={preview} onOpenChange={setPreview} doc={doc} />
    </div>
  );
}
