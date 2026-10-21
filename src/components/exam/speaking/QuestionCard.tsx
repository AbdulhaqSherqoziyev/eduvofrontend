'use client';
/**
 * Question card (design q.265–270, spec §1.3) for Part 1/3 and the Part 2 rounding-off questions.
 * audio_then_text: "Listen…" while the examiner speaks, then the question fades in (no layout jump);
 * audio_only: never the text. Repeat ×1 is active in reveal/countdown, hidden (space kept) while recording.
 */
import { Ear, RotateCcw, Volume2 } from 'lucide-react';
import { useT } from '@/lib/exam/engine/context';
import { Btn } from '../shell/ui';

export function CapsRow({ left, listening }: { left: string; listening: boolean }) {
  const { t } = useT();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: 'var(--x-muted)' }}>{left}</span>
      <span style={{ minWidth: 170, display: 'inline-flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: 'var(--x-sub)', visibility: listening ? 'visible' : 'hidden' }}>
        <Ear size={14} aria-hidden />{t('speaking.examiner_listening')}
      </span>
    </div>
  );
}

export function QuestionCard({ caps, text, showText, audioOnly, listening, repeat }: {
  caps: string; text: string; showText: boolean; audioOnly: boolean; listening: boolean;
  repeat: { show: boolean; enabled: boolean; used: boolean; onClick: () => void } | null;
}) {
  const { t } = useT();
  return (
    <div style={{ width: 660, background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 18, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <CapsRow left={caps} listening={listening} />
      <div style={{ minHeight: 30, display: 'flex', alignItems: 'center' }}>
        {audioOnly ? (
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--x-muted)' }}>{t('speaking.audio_only_note')}</span>
        ) : showText ? (
          <div className="x-fade-in" lang="en" style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.3, lineHeight: 1.4 }}>{text}</div>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, color: 'var(--x-muted)' }}><Volume2 size={18} aria-hidden />{t('speaking.listen')}</span>
        )}
      </div>
      {repeat && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 36, visibility: repeat.show ? 'visible' : 'hidden' }}>
          <Btn h={36} disabled={!repeat.enabled || repeat.used} onClick={repeat.onClick} style={{ fontSize: 13 }} tabIndex={repeat.show ? 0 : -1}>
            <RotateCcw size={14} aria-hidden />{t(repeat.used ? 'chrome.repeat_question_used' : 'chrome.repeat_question')}
          </Btn>
          {!repeat.used && <span style={{ fontSize: 12, color: 'var(--x-muted)' }}>{t('speaking.repeat_note')}</span>}
        </div>
      )}
    </div>
  );
}
