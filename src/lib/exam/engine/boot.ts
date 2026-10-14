/** Where does a (re)opened attempt land? Pure, so resume logic is testable. */
import { isAnswered } from '../format';
import { store, type LocalAnswers } from '../storage';
import type { AttemptState } from '../types';
import type { AnswerEntry, Phase, UiPrefs } from './state';
import { DEFAULT_UI } from './state';
import type { Locale } from '../i18n';

export interface BootDecision {
  phase: Phase; stageKey: string | null; prevSubmitted: string | null; timeEnded: string | null;
  answers: Record<string, AnswerEntry>; ui: UiPrefs; resumeSaved: number;
}

const title = (d: AttemptState, sectionKey?: string) => d.config.sections.find((s) => s.key === sectionKey)?.title ?? sectionKey ?? '';

/** Server answers vs device copy: the higher clientSeq wins; device-newer stays unsynced. */
export function mergeAnswers(d: AttemptState, local: LocalAnswers): Record<string, AnswerEntry> {
  const out: Record<string, AnswerEntry> = {};
  for (const a of d.answers) out[a.questionId] = { v: a.value, seq: a.clientSeq, synced: true };
  for (const [id, l] of Object.entries(local)) {
    const cur = out[id];
    if (!cur || l.seq > cur.seq) out[id] = { v: l.v as AnswerEntry['v'], seq: l.seq, synced: false };
  }
  return out;
}

/** `initialLocale`: the host's instruction language at boot (mock.eduvo.uz: the learner's site language). */
export function decideBoot(d: AttemptState, initialLocale?: Locale): BootDecision {
  const id = d.attempt.id;
  const answers = mergeAnswers(d, store.answers(id));
  const defLocale = d.config.ui?.ui_locale === 'uz' || d.config.family === 'HSK' ? 'uz' : 'en';
  const ui: UiPrefs = { ...DEFAULT_UI, locale: store.locale() || defLocale, ...store.ui<Partial<UiPrefs>>(id, {}) };
  // B2C host: every (re)open starts in the learner's site language; the select changes it for this visit
  if (initialLocale) ui.locale = initialLocale;
  const main = d.stages.filter((s) => !s.separateSitting);
  const cur = main.find((s) => s.status === 'IN_PROGRESS');
  const next = main.find((s) => s.status === 'PENDING');
  const locked = main.filter((s) => s.status === 'LOCKED');
  const lastLocked = locked[locked.length - 1];
  const resumeSaved = cur ? Object.entries(answers).filter(([qid, a]) => isAnswered(a.v) && (d.answers.find((x) => x.questionId === qid)?.stageKey ?? cur.stageKey) === cur.stageKey).length : 0;
  const base = { answers, ui, timeEnded: null as string | null, resumeSaved };

  if (d.attempt.status !== 'ACTIVE' || (!cur && !next)) return { ...base, phase: 'complete', stageKey: null, prevSubmitted: null };
  if (cur) return { ...base, phase: 'welcome', stageKey: cur.stageKey, prevSubmitted: null };

  // The stage this device was working on was locked by the server while away (G8 resume.time_ended).
  const active = store.activeStage(id);
  if (active && d.stages.find((s) => s.stageKey === active)?.status === 'LOCKED') {
    return { ...base, phase: 'welcome', stageKey: next!.stageKey, prevSubmitted: title(d, lastLocked?.sectionKey), timeEnded: title(d, d.stages.find((s) => s.stageKey === active)?.sectionKey) };
  }
  if (lastLocked) return { ...base, phase: 'intro', stageKey: next!.stageKey, prevSubmitted: title(d, lastLocked.sectionKey) };
  return { ...base, phase: 'precheck', stageKey: next!.stageKey, prevSubmitted: null };
}
