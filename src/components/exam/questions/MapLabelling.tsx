'use client';
/**
 * Plan / map / diagram labelling (ielts.md §3 #7, #12; cefr.md #4). The image
 * fills the column (no zoom, like the real test). `options`: each place picks a
 * letter (radiogroup pills); `text`: numbered markers on the image + inputs.
 */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import type { MapLabelContent } from '@/lib/exam/content-types';
import { absMedia } from '@/lib/exam/api';
import { useExam, useT } from '@/lib/exam/engine/context';
import type { ExamCtl } from '@/lib/exam/engine/controller';
import { blobUrlFor, subscribeBlobs } from '@/lib/exam/engine/media';
import type { Group } from '@/lib/exam/types';
import { Choices } from './Choices';
import { GapCard } from './GapFillInline';
import { QuestionCard } from './QuestionCard';

const AUTO_RETRIES = 3;
const RETRY_DELAYS = [800, 2500, 6000];
const BOX: CSSProperties = { height: 220, borderRadius: 12, border: '1.5px solid var(--x-line)', background: 'var(--x-tile)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 13, fontWeight: 700, color: 'var(--x-muted)' };

/**
 * Exam picture. Source order: preloaded blob (survives URL expiry) → signed URL.
 * A failed load (or a missing URL) is retried by itself 3 times with a FRESH
 * signed URL (idempotent stage start); only then "Image unavailable · Retry",
 * and Retry also fetches a fresh URL — never just re-renders the dead one.
 */
export function ExamImage({ assetId, alt, minH = 200 }: { assetId?: string | null; alt?: string; minH?: number }) {
  const { s, refreshMedia } = useExam() as ExamCtl & { refreshMedia?: () => Promise<boolean> };
  const { t } = useT();
  const blob = useSyncExternalStore(subscribeBlobs, () => blobUrlFor(assetId), () => null);
  const [blobBad, setBlobBad] = useState(false);
  const raw = s.media.find((m) => m.assetId === assetId)?.url;
  const showBlob = !!blob && !blobBad;
  const src = showBlob ? blob : raw ? absMedia(raw) : undefined;
  const [fails, setFails] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [gen, setGen] = useState(0);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const recover = useCallback((delay: number) => {
    setWaiting(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      void (async () => {
        try { await refreshMedia?.(); } catch { /* the next attempt / Retry handles it */ }
        setWaiting(false);
        setGen((g) => g + 1);
      })();
    }, delay);
  }, [refreshMedia]);

  // every failure (load error or no URL at all) → fresh URL after a short pause, up to 3 times
  useEffect(() => { if (fails > 0 && fails <= AUTO_RETRIES) recover(RETRY_DELAYS[fails - 1]); }, [fails, recover]);
  useEffect(() => { if (assetId && !src && !waiting) setFails((f) => f + 1); }, [assetId, src, waiting, gen]);

  if (!assetId) return null;
  if (src && (showBlob || (!waiting && fails <= AUTO_RETRIES))) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img key={`${gen}:${showBlob ? 'b' : 'u'}`} src={src} alt={alt ?? ''} onLoad={() => setFails(0)}
      onError={() => { if (showBlob) setBlobBad(true); setFails((f) => f + 1); }}
      draggable={false} style={{ display: 'block', width: '100%', minHeight: minH, objectFit: 'contain', borderRadius: 12, border: '1px solid var(--x-line)', background: '#fff' }} />;
  }
  if (fails > AUTO_RETRIES && !waiting) {
    return (
      <div style={BOX}>
        {t('writing.image_unavailable')} · <button type="button" onClick={() => { setBlobBad(false); setFails(0); recover(0); }} style={{ background: 'none', border: 'none', color: 'var(--x-link)', fontWeight: 700, padding: 0 }}>{t('chrome.retry')}</button>
      </div>
    );
  }
  return <div aria-busy="true" aria-label={alt ?? ''} className="x-dot-pulse" style={{ ...BOX, border: '1px solid var(--x-line)' }} />;
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
