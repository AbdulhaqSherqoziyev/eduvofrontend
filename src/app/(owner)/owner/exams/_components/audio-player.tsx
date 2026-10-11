'use client';

import { useEffect, useState } from 'react';
import { ownerExamsApi } from '@/lib/api/owner-exams';

/** Part audio for the owner: `GET /platform/exams/media/:id/file` with the platform token → blob. */
export function AudioPlayer({ assetId, durationMs }: { assetId: string; durationMs: number | null }) {
  const [url, setUrl] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  const load = async () => {
    setState('loading');
    try { setUrl(URL.createObjectURL(await ownerExamsApi.mediaBlob(assetId))); setState('idle'); } catch { setState('error'); }
  };
  const len = durationMs ? `${Math.floor(durationMs / 60000)}:${String(Math.round(durationMs / 1000) % 60).padStart(2, '0')}` : '';
  if (url) return <audio controls src={url} className="h-9 w-full max-w-[420px]" />;
  return (
    <div className="flex items-center gap-3 text-[12.5px] font-semibold text-muted">
      <button type="button" onClick={() => void load()} disabled={state === 'loading'} className="h-8 rounded-[10px] bg-background px-3 font-bold text-primary shadow-nm-sm">
        {state === 'loading' ? 'Yuklanmoqda…' : '▶ Audio'}
      </button>
      <span>{len}</span>
      {state === 'error' && <span>Audio yuklanmadi. Qayta bosib ko&apos;ring.</span>}
    </div>
  );
}
