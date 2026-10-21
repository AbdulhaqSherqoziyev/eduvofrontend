'use client';
/** Interactive pieces of the phone landing (Mobile Landing.dc.html): sample result switcher, how-it-works carousel, footer theme link. */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getSession } from '@/lib/mock/api/client';
import { patchMe } from '@/lib/mock/api/endpoints';
import { applyTheme, currentTheme } from '@/lib/mock/theme';
import { sx } from '@/lib/mock/sx';

type Exam = 'ielts' | 'sat';
interface Row { name: string; v: string; p: number; ai?: boolean }
const HERO: Record<Exam, { score: string; max: string; deg: number; size: string; rows: Row[] }> = {
  ielts: { score: '6.5', max: '9.0', deg: (6.5 / 9) * 360, size: '40px', rows: [{ name: 'Listening', v: '7.0', p: 7 / 9 }, { name: 'Reading', v: '6.5', p: 6.5 / 9 }, { name: 'Writing', v: '6.0', p: 6 / 9, ai: true }] },
  sat: { score: '1380', max: '1600', deg: (980 / 1200) * 360, size: '32px', rows: [{ name: 'Reading & Writing', v: '680', p: 480 / 600 }, { name: 'Math', v: '700', p: 500 / 600 }] },
};

export function PhoneSample() {
  const t = useTranslations('landing.phone');
  const lang = useLocale();
  const [exam, setExam] = useState<Exam>('ielts');
  const [picked, setPicked] = useState(false);
  useEffect(() => {
    if (picked) return;
    const id = setInterval(() => setExam((e) => (e === 'ielts' ? 'sat' : 'ielts')), 4500);
    return () => clearInterval(id);
  }, [picked]);
  const h = HERO[exam];
  const color = `var(--${exam})`;
  const tab = (e: Exam, label: string) => (
    <button type="button" role="tab" aria-selected={exam === e} onClick={() => { setExam(e); setPicked(true); }} lang="en"
      style={{ ...sx('height:40px;border:0;border-radius:12px;cursor:pointer;font-weight:800;font-size:14px;background:var(--bg)'), boxShadow: exam === e ? 'var(--raise-sm)' : 'none', color: exam === e ? `var(--${e})` : 'var(--mut)' }}>{label}</button>
  );
  return (
    <>
      <div role="tablist" style={sx('display:grid;grid-template-columns:1fr 1fr;padding:5px;border-radius:16px;box-shadow:var(--inset);gap:5px')}>
        {tab('ielts', 'IELTS Academic')}{tab('sat', 'Digital SAT')}
      </div>
      <div style={sx('border-radius:26px;box-shadow:var(--raise);padding:18px;display:flex;flex-direction:column;gap:16px')}>
        <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:8px')}>
          <span className="m-eyebrow" style={sx('font-size:11px;color:var(--mut)')}>{t('sampleResult')}</span>
          <span className="m-pill m-pill--ok" style={sx('font-size:12px')}>{exam === 'ielts' ? 'CEFR B2' : t('satBadge')}</span>
        </div>
        <div style={sx('display:flex;align-items:center;gap:18px')}>
          <div style={{ ...sx('width:116px;height:116px;flex:none;border-radius:50%;padding:10px;box-shadow:var(--raise-sm)'), background: `conic-gradient(${color} ${h.deg}deg, var(--hover) 0)` }}>
            <div style={sx('width:100%;height:100%;border-radius:50%;background:var(--bg);box-shadow:var(--inset);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px')}>
              <span style={{ ...sx('font-weight:800;letter-spacing:-0.05em;line-height:1'), fontSize: h.size }}><bdi dir="ltr">{h.score}</bdi></span>
              <span style={sx('font-size:10px;font-weight:800;color:var(--mut);text-transform:uppercase')}>{t('of', { max: h.max })}</span>
            </div>
          </div>
          <div style={sx('flex:1;min-width:0;display:flex;flex-direction:column;gap:10px')}>
            {h.rows.map((r) => (
              <div key={r.name} style={sx('display:flex;flex-direction:column;gap:5px')}>
                <div style={sx('display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:700;color:var(--ink2)')}>
                  <span lang="en" style={sx('display:flex;gap:5px;align-items:center')}>{r.name}{r.ai && <span style={sx('padding:1px 5px;border-radius:5px;background:var(--aiBg);color:var(--ai);font-size:9px;font-weight:800')}>AI</span>}</span>
                  <b style={sx('font-size:14px;color:var(--ink)')}><bdi dir="ltr">{r.v}</bdi></b>
                </div>
                <div style={sx('height:7px;border-radius:99px;box-shadow:var(--inset);overflow:hidden')}>
                  <div style={{ ...sx('height:100%;border-radius:99px;transition:width .5s ease'), width: `${Math.round(r.p * 100)}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={sx('display:flex;gap:8px;align-items:center;padding:12px 14px;border-radius:16px;box-shadow:var(--inset);font-size:13px;line-height:1.45;color:var(--ink2)')}>
          <span style={sx('width:26px;height:26px;flex:none;border-radius:8px;background:var(--aiBg);color:var(--ai);display:grid;place-items:center;font-size:11px;font-weight:800')}>AI</span>
          <span>{t(exam === 'ielts' ? 'tipIelts' : 'tipSat')}</span>
        </div>
        <Link href={`/${lang}/sample-result`} style={sx('font-size:14px;font-weight:800;display:flex;align-items:center;gap:6px')}>{t('seeSample')}<Chevron size={7} w={2} /></Link>
      </div>
    </>
  );
}

/** Small CSS chevron pointing "forward" (flips in RTL). */
export function Chevron({ size = 8, w = 2.2, color = 'currentColor' }: { size?: number; w?: number; color?: string }) {
  return <span aria-hidden className="m-fwd" style={{ width: size, height: size, borderTop: `${w}px solid ${color}`, borderInlineEnd: `${w}px solid ${color}`, flex: 'none' }} />;
}

export function PhoneHow({ items }: { items: Array<{ title: string; text: string }> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [cur, setCur] = useState(0);
  const onScroll = () => {
    const el = ref.current;
    const c = el?.firstElementChild as HTMLElement | null;
    if (!el || !c) return;
    const i = Math.min(items.length - 1, Math.round(Math.abs(el.scrollLeft) / (c.offsetWidth + 12)));
    if (i !== cur) setCur(i);
  };
  return (
    <>
      <div ref={ref} onScroll={onScroll} style={sx('display:flex;gap:12px;overflow-x:auto;scrollbar-width:none;scroll-snap-type:x mandatory;padding:8px 18px 18px;scroll-padding:0 18px;margin:0 -18px')}>
        {items.map((it, i) => (
          <div key={i} style={sx('flex:none;width:72%;scroll-snap-align:start;border-radius:22px;box-shadow:var(--raise);padding:18px;display:flex;flex-direction:column;gap:10px')}>
            <span style={sx('width:40px;height:40px;border-radius:13px;box-shadow:var(--inset);display:grid;place-items:center;font-weight:800;font-size:16px;color:var(--blue)')}>{i + 1}</span>
            <b style={sx('font-size:16px;line-height:1.3')}>{it.title}</b>
            <span style={sx('font-size:13px;color:var(--ink2);line-height:1.55')}>{it.text}</span>
          </div>
        ))}
      </div>
      <div aria-hidden style={sx('display:flex;justify-content:center;gap:6px')}>
        {items.map((_, i) => <span key={i} style={{ ...sx('height:6px;border-radius:99px;transition:width .25s ease'), width: i === cur ? 20 : 6, background: i === cur ? 'var(--blue)' : 'var(--line)' }} />)}
      </div>
    </>
  );
}

export function ThemeLink() {
  const t = useTranslations('landing.phone');
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(currentTheme() === 'dark'), []);
  const flip = () => {
    const next = dark ? 'light' : 'dark';
    applyTheme(next);
    setDark(!dark);
    if (getSession().status === 'learner') void patchMe({ theme: next }).catch(() => undefined);
  };
  return <button type="button" onClick={flip} style={sx('border:0;background:transparent;color:var(--ink2);font-weight:600;font-size:12px;cursor:pointer;padding:0;font-family:inherit')}>{t(dark ? 'themeLight' : 'themeDark')}</button>;
}
