'use client';
/**
 * mock.eduvo.uz — Speaking on the result page (speaking-design.md §2 skin c, §2.4 phone):
 * SpeakingResultPanel in the Writing `section` frame (m-card). Player strings in the learner's
 * language (uz/ru, else en). Delete → contract §6, then the result is read again. Sample result: no
 * audio (`sampleNoAudio`), nothing to delete. Pending → "Speaking'ni topshirish" (desktop) or the
 * "open on a computer" note on a phone.
 */
import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { SpeakingResultPanel } from '@/components/exam/results/speaking/SpeakingResultPanel';
import { t as pt, type Locale } from '@/lib/exam/i18n';
import type { SpeakingResult } from '@/lib/exam/speaking-types';
import { deleteRecordings } from '@/lib/mock/api/endpoints';
import type { MockResultExt } from '@/lib/mock/api/types';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { sx } from '@/lib/mock/sx';
import { useToast } from '../toast';

export function B2cSpeaking({ sp, attemptId, sample, notGraded, onChanged, phone }: {
  sp: SpeakingResult; attemptId?: string; sample?: boolean; notGraded: MockResultExt['notGraded']; onChanged: () => void; phone?: boolean;
}) {
  const t = useTranslations('results');
  const toast = useToast();
  const { lang, href } = useLang();
  const loc: Locale = lang === 'uz' || lang === 'ru' ? lang : 'en';
  const tx = useCallback((k: Parameters<typeof pt>[0], v?: Record<string, string | number>) => pt(k, loc, v), [loc]);
  const refunded = !!notGraded?.refunded && notGraded.sections.includes('speaking');
  const panel = (
    <SpeakingResultPanel
      sp={sp} skin="b2c" mode="b2c" tx={tx} onToast={toast}
      onDelete={sample || !attemptId ? undefined : async () => { await deleteRecordings(attemptId); onChanged(); }}
      takeHref={!sample && attemptId && sp.status === 'pending' ? href(`/exam/${attemptId}`) : null}
      phoneNote={<div style={sx('padding:12px 14px;border-radius:14px;box-shadow:var(--inset);font-size:14px;font-weight:700;color:var(--ink2)')}>{t('speakingComputer')}</div>}
      noAudioNote={sample ? t('sampleNoAudio') : undefined}
      gradingNote={t('speakingPendingBody')}
      b2c={{ unfairHref: attemptId ? href(`/help/contact?topic=speaking_result&attempt=${encodeURIComponent(attemptId)}`) : undefined, refundedText: refunded ? t('speakingRefunded') : null, notGradedText: t('speakingNotGraded') }}
    />
  );
  if (phone) return <div style={sx('display:flex;flex-direction:column;gap:14px;padding-bottom:24px')}>{panel}</div>;
  return <section className="m-card" style={sx('padding:clamp(20px,3vw,32px);display:flex;flex-direction:column;gap:22px')}>{panel}</section>;
}
