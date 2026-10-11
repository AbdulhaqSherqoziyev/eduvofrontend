'use client';
/**
 * Reference sheet (sat.md §6.2, design q.318–324 → D-11: the full sheet, not 7
 * rows): figure + formula cells, then the three facts. Floating and draggable,
 * may stay open next to the calculator. Formulas and facts are exam content,
 * so they stay in English whatever the interface language.
 */
import { useT } from '@/lib/exam/engine/context';
import { t as tr } from '@/lib/exam/i18n';
import { FloatPanel } from './FloatPanel';
import { Tex } from './MathText';

const S = { fill: 'none', stroke: '#1E2A3A', strokeWidth: 1.4 } as const;
const L = { fontSize: 10, fill: '#4A586C', fontStyle: 'italic' } as const;

const FIGS: { key: string; svg: React.ReactNode; tex: string[] }[] = [
  { key: 'circle', svg: <><circle cx="40" cy="32" r="24" {...S} /><line x1="40" y1="32" x2="64" y2="32" {...S} /><text x="48" y="28" {...L}>r</text></>, tex: ['A = \\pi r^2', 'C = 2\\pi r'] },
  { key: 'rect', svg: <><rect x="10" y="14" width="60" height="34" {...S} /><text x="36" y="60" {...L}>ℓ</text><text x="74" y="35" {...L}>w</text></>, tex: ['A = \\ell w'] },
  { key: 'tri', svg: <><polygon points="8,52 72,52 30,10" {...S} /><line x1="30" y1="10" x2="30" y2="52" {...S} strokeDasharray="3 2" /><text x="33" y="36" {...L}>h</text><text x="38" y="62" {...L}>b</text></>, tex: ['A = \\tfrac{1}{2}bh'] },
  { key: 'right', svg: <><polygon points="12,52 68,52 12,12" {...S} /><rect x="12" y="44" width="8" height="8" {...S} /><text x="3" y="34" {...L}>b</text><text x="38" y="62" {...L}>a</text><text x="42" y="28" {...L}>c</text></>, tex: ['c^2 = a^2 + b^2'] },
  { key: '306090', svg: <><polygon points="12,52 70,52 12,18" {...S} /><text x="0" y="38" {...L}>x</text><text x="34" y="62" {...L}>x√3</text><text x="44" y="30" {...L}>2x</text><text x="16" y="28" {...L}>60°</text><text x="50" y="49" {...L}>30°</text></>, tex: [] },
  { key: '454590', svg: <><polygon points="14,52 60,52 14,10" {...S} /><text x="3" y="34" {...L}>s</text><text x="34" y="62" {...L}>s</text><text x="40" y="28" {...L}>s√2</text><text x="44" y="49" {...L}>45°</text><text x="17" y="22" {...L}>45°</text></>, tex: ['\\text{Special right triangles}'] },
  { key: 'box', svg: <><rect x="10" y="22" width="44" height="30" {...S} /><polyline points="10,22 24,10 68,10 54,22" {...S} /><polyline points="68,10 68,40 54,52" {...S} /><text x="30" y="62" {...L}>ℓ</text><text x="70" y="48" {...L}>w</text><text x="2" y="40" {...L}>h</text></>, tex: ['V = \\ell w h'] },
  { key: 'cyl', svg: <><ellipse cx="40" cy="14" rx="22" ry="6" {...S} /><path d="M18 14 V48 A22 6 0 0 0 62 48 V14" {...S} /><text x="64" y="34" {...L}>h</text><text x="44" y="12" {...L}>r</text></>, tex: ['V = \\pi r^2 h'] },
  { key: 'sphere', svg: <><circle cx="40" cy="32" r="24" {...S} /><ellipse cx="40" cy="32" rx="24" ry="7" {...S} strokeDasharray="3 2" /><text x="46" y="28" {...L}>r</text></>, tex: ['V = \\tfrac{4}{3}\\pi r^3'] },
  { key: 'cone', svg: <><path d="M40 8 L18 50 A22 6 0 0 0 62 50 Z" {...S} /><line x1="40" y1="8" x2="40" y2="50" {...S} strokeDasharray="3 2" /><text x="43" y="34" {...L}>h</text><text x="48" y="60" {...L}>r</text></>, tex: ['V = \\tfrac{1}{3}\\pi r^2 h'] },
  { key: 'pyr', svg: <><polygon points="12,50 52,50 66,38 26,38" {...S} /><polyline points="12,50 40,8 52,50" {...S} /><line x1="40" y1="8" x2="66" y2="38" {...S} /><text x="30" y="62" {...L}>ℓ</text><text x="62" y="50" {...L}>w</text><text x="42" y="30" {...L}>h</text></>, tex: ['V = \\tfrac{1}{3}\\ell w h'] },
];

export function ReferenceSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT();
  const title = t('sat.reference_title');
  return (
    <FloatPanel title={title} label={title} open={open} onClose={onClose} initial={{ x: 28, y: 20, w: 400, h: 0 }}>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '10px 8px' }}>
          {FIGS.map((f) => (
            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, borderBottom: '1px solid #F1F4F8', paddingBottom: 6 }}>
              <svg viewBox="0 0 80 66" width="80" height="66" aria-hidden>{f.svg}</svg>
              {f.tex.map((x) => <span key={x} style={{ fontSize: 13 }}><Tex tex={x} /></span>)}
            </div>
          ))}
        </div>
        {(['sat.ref_arc', 'sat.ref_rad', 'sat.ref_tri'] as const).map((k) => (
          <div key={k} style={{ lineHeight: 1.5, color: '#1E2A3A', fontWeight: 600 }}>{tr(k, 'en')}</div>
        ))}
      </div>
    </FloatPanel>
  );
}
