'use client';
/**
 * Desmos calculator panel (sat.md §6.1, design A-table): floating, draggable,
 * resizable (380×420, min 360×400), graphing ↔ scientific at any time.
 * The script loads on first open in a Math module; both calculators live until
 * the module ends, so closing the panel keeps the expressions.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useT } from '@/lib/exam/engine/context';
import { desmosAvailable, GRAPHING_OPTS, loadDesmos, SCIENTIFIC_OPTS, type DesmosCalc } from '@/lib/exam/sat/desmos';
import { Bi, Btn, Spinner } from '../shell/ui';
import { FloatPanel } from './FloatPanel';

type Mode = 'graphing' | 'scientific';

export function DesmosPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, bi } = useT();
  const [mode, setMode] = useState<Mode>('graphing');
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'failed' | 'unavailable'>(() => (desmosAvailable() ? 'idle' : 'unavailable'));
  const els = useRef<Record<Mode, HTMLDivElement | null>>({ graphing: null, scientific: null });
  const calcs = useRef<Partial<Record<Mode, DesmosCalc>>>({});

  const ensure = useCallback(async (m: Mode) => {
    if (calcs.current[m] || !desmosAvailable()) return;
    setState('loading');
    try {
      const D = await loadDesmos();
      const el = els.current[m];
      if (!el || calcs.current[m]) { setState('ready'); return; }
      calcs.current[m] = m === 'graphing' ? D.GraphingCalculator(el, GRAPHING_OPTS) : D.ScientificCalculator(el, SCIENTIFIC_OPTS);
      setState('ready');
    } catch {
      setState('failed');
    }
  }, []);

  useEffect(() => { if (open) void ensure(mode); }, [open, mode, ensure]);
  useEffect(() => () => { for (const c of Object.values(calcs.current)) c?.destroy(); calcs.current = {}; }, []);
  const resize = useCallback(() => { for (const c of Object.values(calcs.current)) c?.resize(); }, []);
  useEffect(() => { if (open) window.requestAnimationFrame(resize); }, [open, mode, resize]);

  const other: Mode = mode === 'graphing' ? 'scientific' : 'graphing';
  const toggle = (
    <button type="button" onClick={() => setMode(other)} style={{ background: 'none', border: 'none', padding: 0, color: '#9DB8F5', fontSize: 12.5, fontWeight: 700 }}>
      {t(other === 'scientific' ? 'sat.calc_to_scientific' : 'sat.calc_to_graphing')}
    </button>
  );
  const title = t(mode === 'graphing' ? 'sat.calc_graphing' : 'sat.calc_scientific');

  return (
    <FloatPanel title={title} label={title} open={open} onClose={onClose} resizable initial={{ x: -28, y: 20, w: 380, h: 420 }} headerExtra={state === 'unavailable' ? null : toggle} onResize={resize}>
      {(['graphing', 'scientific'] as Mode[]).map((m) => (
        <div key={m} ref={(n) => { els.current[m] = n; }} style={{ position: 'absolute', inset: 0, display: m === mode ? 'block' : 'none' }} />
      ))}
      {state !== 'ready' && (
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg,#F6F8FB 0 10px,#EEF2F7 10px 20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center', color: '#4A586C' }}>
          {state === 'loading' || state === 'idle' ? <><Spinner size={22} /><span style={{ fontSize: 13, fontWeight: 700 }}>{t('sat.calc_loading')}</span></> : (
            <>
              <Bi pair={bi(state === 'unavailable' ? 'sat.calc_unavailable' : 'sat.calc_failed')} size={13.5} center />
              {state === 'failed' && <Btn h={36} onClick={() => void ensure(mode)} style={{ fontSize: 13, background: '#fff' }}>{t('chrome.retry')}</Btn>}
            </>
          )}
        </div>
      )}
    </FloatPanel>
  );
}
