'use client';

import { useState } from 'react';
import { NmButton } from '@/components/ui/nm-button';
import { keyList, keyLocked, type BankQuestion } from '@/lib/api/owner-exams';
import { KeyChips } from './key-chips';
import { errText, usePatchQuestions } from './use-owner-exams';

const toStr = (a: unknown) => keyList(a).map((x) => (typeof x === 'string' ? x : JSON.stringify(x)));
const split = (s: string) => s.split(/[,;\n]/).map((x) => x.trim()).filter(Boolean);
const field = 'w-full rounded-[12px] bg-background px-3 py-2 text-[13px] shadow-nm-inset-sm outline-none';

/** One question: prompt, type, key + accepted; inline edit → PATCH (objects in answerKey stay untouched). */
export function QuestionRow({ testId, q }: { testId: string; q: BankQuestion }) {
  const patch = usePatchQuestions(testId);
  const [edit, setEdit] = useState(false);
  const objKey = keyLocked(q.answerKey);
  const [key, setKey] = useState(toStr(q.answerKey).join(', '));
  const [acc, setAcc] = useState(q.accepted.join(', '));
  const [why, setWhy] = useState(q.explanation ?? '');
  const prompt = (q.content as { prompt?: string; label?: string }).prompt ?? (q.content as { label?: string }).label;
  const save = () => patch.mutate([{ id: q.id, ...(objKey ? {} : { answerKey: split(key) }), accepted: split(acc), explanation: why.trim() || null }], { onSuccess: () => setEdit(false) });

  return (
    <div className="rounded-[14px] px-3.5 py-2.5 shadow-nm-inset-sm">
      <div className="grid grid-cols-[36px_minmax(0,1fr)_auto_auto] items-start gap-3 text-[13px]">
        <span className="font-extrabold text-[#5b6b82]">{q.no}</span>
        <span>{prompt ?? <span className="text-muted">—</span>} <span className="text-[11px] text-[#9aa6b8]">· {q.type}{q.isScored ? '' : ' · ballanmaydi'}</span></span>
        <KeyChips answers={toStr(q.answerKey)} accepted={q.accepted} />
        <button type="button" className="text-[12px] font-bold text-primary" onClick={() => setEdit((e) => !e)}>{edit ? 'Yopish' : 'Tahrirlash'}</button>
      </div>
      {edit && (
        <div className="mt-3 grid gap-2.5 pl-12">
          <label className="text-[12px] font-bold text-muted">Javob kaliti (vergul bilan){objKey && ' — murakkab kalit, faqat JSON importda o\'zgaradi'}
            <input className={field} value={key} disabled={objKey} onChange={(e) => setKey(e.target.value)} /></label>
          <label className="text-[12px] font-bold text-muted">Qabul qilinadigan variantlar (vergul bilan)
            <input className={field} value={acc} onChange={(e) => setAcc(e.target.value)} placeholder="colour, color" /></label>
          <label className="text-[12px] font-bold text-muted">Izoh (natijada ko&apos;rinadi)
            <textarea className={field} rows={2} value={why} onChange={(e) => setWhy(e.target.value)} /></label>
          {patch.error && <div className="text-[12px] font-semibold text-danger">{errText(patch.error)}</div>}
          <div className="flex gap-2">
            <NmButton size="sm" disabled={patch.isPending || (!objKey && !split(key).length)} onClick={save}>{patch.isPending ? 'Saqlanmoqda…' : 'Saqlash'}</NmButton>
            <NmButton size="sm" variant="soft" onClick={() => setEdit(false)}>Bekor qilish</NmButton>
          </div>
        </div>
      )}
    </div>
  );
}
