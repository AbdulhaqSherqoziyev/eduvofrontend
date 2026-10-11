'use client';
/**
 * Pre-check (design A12/G6, Sevara T1–T5, T41): nothing has started yet. Cards
 * by config: Headphones, Microphone (Speaking only), Connection (real), Fullscreen,
 * Try the interface, Settings (interface language), Rules. Start = fullscreen + intro.
 */
import { PlayCircle } from 'lucide-react';
import { useState } from 'react';
import { useExam, useT } from '@/lib/exam/engine/context';
import { requestFullscreen } from '@/lib/exam/engine/integrity';
import type { TextKey } from '@/lib/exam/i18n';
import { LangSwitch } from '../shell/SettingsMenu';
import { Btn, Caps } from '../shell/ui';
import { CheckCard, hint, type CheckStatus } from './precheck/CheckCard';
import { ConnectionCard, type Conn } from './precheck/ConnectionCard';
import { HeadphonesCard } from './precheck/HeadphonesCard';
import { MicCard } from './precheck/MicCard';

const RULE_BY_FAMILY: Record<string, TextKey> = { IELTS: 'precheck.rule_ielts', CEFR: 'precheck.rule_cefr', SAT: 'precheck.rule_sat', TOEFL: 'precheck.rule_toefl', HSK: 'precheck.rule_hsk' };

export function PreCheck() {
  const { s, dispatch, media } = useExam();
  const { t } = useT();
  const cfg = s.config!;
  const main = s.stages.filter((x) => !x.separateSitting);
  const sections = cfg.sections.filter((sec) => main.some((x) => x.sectionKey === sec.key));
  const needAudio = sections.some((sec) => sec.stages.some((st) => st.audio)) || !!cfg.precheck?.includes('audio');
  const needMic = sections.some((sec) => sec.stages.some((st) => st.kind === 'speaking'));
  const [hp, setHp] = useState<CheckStatus>('not_checked');
  const [mic, setMic] = useState<CheckStatus>('not_checked');
  const [conn, setConn] = useState<Conn>('measuring');
  const ready = (!needAudio || hp === 'ready') && (!needMic || mic === 'ready') && conn !== 'offline' && conn !== 'measuring';
  const rules: TextKey[] = ['precheck.rule_timer', 'precheck.rule_lock', 'precheck.rule_autosave', 'precheck.rule_exits'];
  const examRule = RULE_BY_FAMILY[cfg.family];

  return (
    <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', gap: 26 }}>
      <div style={{ textAlign: 'center', maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Caps style={{ letterSpacing: 1.2 }}>{cfg.name.toUpperCase()} · {t(s.attempt?.mode === 'section' ? 'x.single_section' : 'x.full_mock').toUpperCase()}</Caps>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>{t('precheck.title')}</div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{t('precheck.nothing_started')}</div>
        <div style={{ fontSize: 14, color: 'var(--x-sub)' }}>{t('precheck.subtitle')}</div>
        <div style={{ fontSize: 13, color: 'var(--x-muted)' }}>{t('precheck.lang_note')}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 440px)', gap: 16 }}>
        {needAudio && <HeadphonesCard status={hp} onStatus={setHp} />}
        <ConnectionCard media={media} conn={conn} onConn={setConn} />
        {needMic && <MicCard status={mic} onStatus={setMic} />}
        <CheckCard title={t('precheck.fullscreen_title')}><div style={hint}>{t('precheck.fullscreen_body')}</div></CheckCard>
        <div style={{ gridColumn: '1 / -1', background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 18, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--x-sel-bg)', color: 'var(--x-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><PlayCircle size={22} aria-hidden /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{t('precheck.try_title')}</div>
            <div style={{ fontSize: 14, color: 'var(--x-sub)' }}>{t('precheck.try_body')}</div>
          </div>
          <Btn h={44} onClick={() => dispatch({ t: 'PHASE', phase: 'tryout' })}>{t('chrome.try_interface')}</Btn>
        </div>
        <div style={{ gridColumn: '1 / -1', minHeight: 52, background: 'var(--x-tile)', borderRadius: 14, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{t('chrome.interface_lang')}</span>
          <LangSwitch />
        </div>
        <CheckCard title={t('precheck.rules_title')} span>
          {[...rules, ...(examRule ? [examRule] : [])].map((r) => (
            <div key={r} style={{ display: 'flex', gap: 10, fontSize: 13.5, color: 'var(--x-sub)', lineHeight: 1.45 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--x-accent)', marginTop: 7, flexShrink: 0 }} /><span>{t(r, { n: 1 })}</span>
            </div>
          ))}
        </CheckCard>
      </div>
      <div style={{ width: 896, background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 18, padding: '20px 24px' }}>
        <Caps style={{ marginBottom: 12 }}>{t('x.sections_in_order')}</Caps>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {sections.map((sec) => {
            const st = sec.stages[0];
            const ai = st?.kind === 'writing' || st?.kind === 'speaking';
            const min = st?.timer.duration_sec ? Math.round(st.timer.duration_sec / 60) : null;
            return (
              <div key={sec.key} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 40, padding: '0 14px', borderRadius: 10, background: 'var(--x-tile)', fontSize: 13, fontWeight: 700 }}>
                <span>{sec.title}</span>{min != null && <span style={{ color: 'var(--x-muted)' }}>{t('intro.time_value', { min })}</span>}
                <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.4, borderRadius: 6, padding: '3px 7px', color: ai ? '#5B3FD1' : 'var(--x-ok-fg)', background: ai ? '#EEE9FF' : 'var(--x-ok-bg)' }}>{t(ai ? 'x.ai_badge' : 'x.auto_badge')}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <Btn h={52} style={{ fontSize: 15, borderRadius: 14, padding: '0 22px' }} onClick={() => { window.location.href = '/portal'; }}>{t('chrome.cancel')}</Btn>
          <Btn h={52} variant="accent" disabled={!ready} style={{ fontSize: 15.5, borderRadius: 14, padding: '0 30px' }}
            onClick={() => { requestFullscreen(); dispatch({ t: 'PHASE', phase: 'intro' }); }}>{t('chrome.enter_fullscreen_start')}</Btn>
        </div>
        {!ready && <div style={{ fontSize: 12, color: 'var(--x-muted)' }}>{t('precheck.cta_hint')}</div>}
      </div>
    </div>
  );
}
