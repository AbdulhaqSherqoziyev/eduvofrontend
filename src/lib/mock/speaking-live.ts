/**
 * IELTS Speaking launch flag for mock.eduvo.uz (speaking-design.md §4). Off → Speaking is shown
 * nowhere on the B2C site (catalog/start sections are filtered, static texts keep the old variant).
 * On → Speaking appears wherever the catalog carries `sections[].key === 'speaking'`.
 * Build-time: NEXT_PUBLIC_SPEAKING_LIVE=1. Development only: localStorage `eduvo_speaking_live` = '1' / '0'
 * overrides it in the browser (never in production builds).
 */
import type { Catalog, StartInfo } from './api/types';

function devOverride(): boolean | null {
  if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem('eduvo_speaking_live');
    return v === '1' ? true : v === '0' ? false : null;
  } catch { return null; }
}

export function speakingLive(): boolean {
  return devOverride() ?? process.env.NEXT_PUBLIC_SPEAKING_LIVE === '1';
}

/** Single filter point: the flag off removes Speaking from the catalog (all pages read it from here). */
export function applySpeakingFlag(c: Catalog): Catalog {
  if (speakingLive()) return c;
  return { ...c, exams: c.exams.map((e) => (e.sections.some((s) => s.key === 'speaking') ? { ...e, sections: e.sections.filter((s) => s.key !== 'speaking') } : e)) };
}

/** Start page: same rule for `/mock/start` sections (a full mock picked with Speaking keeps it only when live). */
export function applySpeakingFlagStart(s: StartInfo): StartInfo {
  if (speakingLive()) return s;
  return { ...s, sections: s.sections.filter((x) => x.key !== 'speaking'), systemCheck: s.systemCheck.filter((k) => k !== 'microphone') };
}

/** Does this IELTS catalog sell Speaking right now (flag on + section in the catalog)? */
export function ieltsHasSpeaking(c: Catalog | null | undefined): boolean {
  return !!c && speakingLive() && !!c.exams.find((e) => e.slug === 'ielts')?.sections.some((s) => s.key === 'speaking');
}
