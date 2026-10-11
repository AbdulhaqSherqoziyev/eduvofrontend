'use client';
/**
 * Connection — real measurement (T5, D-21): 5 small requests → median latency,
 * download speed from the actual exam-audio preload. Slow never blocks the
 * start (warning only); offline disables it.
 */
import { useCallback, useEffect, useState } from 'react';
import { examApi } from '@/lib/exam/api';
import { useExam, useT } from '@/lib/exam/engine/context';
import type { PreloadState } from '@/lib/exam/engine/media';
import { Btn } from '../../shell/ui';
import { CheckCard, hint, type CheckStatus } from './CheckCard';

export type Conn = 'measuring' | 'stable' | 'weak' | 'offline';

async function ping(attemptId: string): Promise<number | null> {
  const t0 = performance.now();
  let r = await examApi.time();
  if (!r.ok && r.status === 404) r = (await examApi.getAttempt(attemptId)) as typeof r; // /time not deployed yet
  return r.ok ? performance.now() - t0 : null;
}

export function ConnectionCard({ media, conn, onConn }: { media: PreloadState; conn: Conn; onConn: (c: Conn) => void }) {
  const { s } = useExam();
  const { t } = useT();
  const [lat, setLat] = useState<number | null>(null);

  const measure = useCallback(async () => {
    onConn('measuring');
    if (navigator.onLine === false) { onConn('offline'); return; }
    const xs: number[] = [];
    for (let i = 0; i < 5; i++) { const v = await ping(s.attemptId); if (v != null) xs.push(v); }
    if (!xs.length) { onConn('offline'); setLat(null); return; }
    xs.sort((a, b) => a - b);
    const med = Math.round(xs[Math.floor(xs.length / 2)]);
    setLat(med);
    onConn(med > 800 || xs.length < 4 ? 'weak' : 'stable');
  }, [onConn, s.attemptId]);

  useEffect(() => { void measure(); }, [measure]);
  useEffect(() => {
    if (conn === 'stable' && media.bytesPerSec != null && media.bytesPerSec < 60_000) onConn('weak');
  }, [conn, media.bytesPerSec, onConn]);

  const status: CheckStatus = conn === 'measuring' ? 'checking' : conn === 'stable' ? 'ready' : 'attention';
  const mbps = media.bytesPerSec != null ? ((media.bytesPerSec * 8) / 1e6).toFixed(1) : '—';
  const big = { fontSize: 24, fontWeight: 800, fontVariantNumeric: 'tabular-nums' } as const;
  const small = { fontSize: 13, color: 'var(--x-muted)' } as const;
  const lab = { fontSize: 12, color: 'var(--x-muted)', fontWeight: 600 } as const;
  const pct = Math.round(media.progress * 100);

  return (
    <CheckCard title={t('precheck.conn_title')} status={status}>
      {conn === 'measuring' && <div style={hint}>{t('precheck.conn_measuring')}</div>}
      <div style={{ display: 'flex', gap: 28 }}>
        <div><div style={big}>{mbps} <span style={small}>Mbps</span></div><div style={lab}>{t('x.download')}</div></div>
        <div><div style={big}>{lat ?? '—'} <span style={small}>ms</span></div><div style={lab}>{t('x.latency')}</div></div>
        <div><div style={big}>{pct}<span style={small}>%</span></div><div style={lab}>{t('x.media_preloaded')}</div></div>
      </div>
      {!media.ready && (
        <div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--x-track)' }}><div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: 'var(--x-accent)', transition: 'width 200ms' }} /></div>
          <div style={{ ...lab, marginTop: 6 }}>{t('precheck.media_loading', { p: pct })}</div>
        </div>
      )}
      {media.ready && pct === 100 && <div style={lab}>{t('precheck.media_ready')}</div>}
      {conn === 'weak' && <div style={{ ...hint, color: 'var(--x-warn-fg)' }}>{t('precheck.conn_weak')}</div>}
      {conn === 'offline' && <div style={{ ...hint, color: 'var(--x-warn-fg)' }}>{t('precheck.conn_offline')}</div>}
      {(conn === 'weak' || conn === 'offline') && <Btn h={36} style={{ alignSelf: 'flex-start', fontSize: 13 }} onClick={() => void measure()}>{t('chrome.check_again')}</Btn>}
    </CheckCard>
  );
}
