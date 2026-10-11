'use client';
/**
 * Plan / map / diagram labelling (ielts.md §3 #7, #12; cefr.md #4). The image
 * fills the column (no zoom, like the real test). `options`: each place picks a
 * letter (radiogroup pills); `text`: numbered markers on the image + inputs.
 */
import { useState } from 'react';
import type { MapLabelContent } from '@/lib/exam/content-types';
import { absMedia } from '@/lib/exam/api';
import { useExam, useT } from '@/lib/exam/engine/context';
import type { Group } from '@/lib/exam/types';
import { Choices } from './Choices';
import { GapCard } from './GapFillInline';
import { QuestionCard } from './QuestionCard';

export function ExamImage({ assetId, alt, minH = 200 }: { assetId?: string | null; alt?: string; minH?: number }) {
  const { s } = useExam();
  const { t } = useT();
  const [err, setErr] = useState(0);
  const raw = s.media.find((m) => m.assetId === assetId)?.url;
  const url = raw ? absMedia(raw) : undefined;
  if (!assetId) return null;
  if (!url || err % 2 === 1) {
    return (
      <div style={{ height: 220, borderRadius: 12, border: '1.5px solid var(--x-line)', background: 'var(--x-tile)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 13, fontWeight: 700, color: 'var(--x-muted)' }}>
        {t('writing.image_unavailable')} · <button type="button" onClick={() => setErr((e) => e + 1)} style={{ background: 'none', border: 'none', color: 'var(--x-link)', fontWeight: 700, padding: 0 }}>{t('chrome.retry')}</button>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img key={err} src={url} alt={alt ?? ''} onError={() => setErr((e) => e + 1)} draggable={false} style={{ display: 'block', width: '100%', minHeight: minH, objectFit: 'contain', borderRadius: 12, border: '1px solid var(--x-line)', background: '#fff' }} />;
}

export function MapLabelling({ g }: { g: Group }) {
  const { s, setAnswer } = useExam();
  const c = g.content ?? {};
  const textMode = c.mapMode === 'text';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: 'var(--x-panel)', borderRadius: 14, padding: 14 }}>
        <div style={{ position: 'relative' }}>
        <ExamImage assetId={c.imageAssetId} alt={c.imageAlt} />
        {textMode && (c.markers ?? []).map((m) => (
          <span key={m.no} aria-hidden style={{ position: 'absolute', left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%,-50%)', minWidth: 24, height: 24, borderRadius: 12, background: 'var(--x-dark-bg)', color: 'var(--x-dark-fg)', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{m.no}</span>
        ))}
        </div>
      </div>
      {g.questions.map((q) => {
        if (textMode) return <GapCard key={q.id} q={{ ...q, content: { prompt: (q.content as MapLabelContent).label, wordLimit: (q.content as { wordLimit?: number }).wordLimit } }} />;
        const v = s.answers[q.id]?.v;
        return (
          <QuestionCard key={q.id} id={q.id} label={String(q.no)} prompt={<span>{(q.content as MapLabelContent).label}</span>}>
            <Choices layout="pills" label={`Question ${q.no}`} options={c.options ?? []} selected={typeof v === 'string' ? [v] : []} onPick={(k) => setAnswer([q.id], k)} />
          </QuestionCard>
        );
      })}
    </div>
  );
}
