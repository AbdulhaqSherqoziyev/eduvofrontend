/**
 * Who sees what in the Qo'llanma — SPEC §3.
 *
 * Deliberately built on the sidebar's own predicates (`moduleOn`, `can`,
 * `canViewModulesScreen`, `visibleNavItems`) so a help section can never
 * advertise a screen the menu hides: no second copy of the rule to drift.
 */
import { can } from '@/lib/auth/permissions';
import { canViewModulesScreen, moduleOn } from '@/lib/auth/module-gate';
import { getSessionUser, isSuperAdmin } from '@/lib/auth/session';
import { NAV_ITEMS, visibleNavItems } from '@/lib/nav/items';
import {
  HELP_CHECKLISTS, HELP_CHIPS, HELP_ERRORS, HELP_GLOSSARY, HELP_ORDER, HELP_SAFE_LIST, HELP_SECTIONS,
  HELP_TEACHER_BRIEF, HELP_TIMELINES,
} from './content';
import { MAX_CHIPS } from './constants';
import type {
  HelpAudience, HelpChecklist, HelpChip, HelpErrorItem, HelpGlossaryItem, HelpListItem, HelpQuestion,
  HelpSection, HelpTag, HelpTeacherBrief, HelpTimeline,
} from './types';

export type { HelpAudience };

const ADMIN_ROLES = ['Egasi', 'Administrator', 'Direktor'];
const ADMINISH = ['payment.read', 'transaction.read', 'user.read', 'group.update', 'student.create', 'teacher.read'];

export function helpAudience(teacherOnlyMode: boolean): HelpAudience {
  const u = getSessionUser();
  if (u?.isSuperAdmin) return 'admin';
  if (teacherOnlyMode) return 'teacher';
  if (ADMIN_ROLES.includes(u?.defaultRole ?? '')) return 'admin';
  return ADMINISH.some((p) => can(p)) ? 'admin' : 'teacher';
}

/** module -> permission -> audience. Same order and same functions as the menu. */
export function isVisible(tag: Partial<HelpTag>, aud: HelpAudience): boolean {
  if (tag.module && !moduleOn(tag.module)) return false; // SUPER_ADMIN'ga ham
  if (tag.permission === '@manage') {
    if (!canViewModulesScreen()) return false;
  } else if (tag.permission && !isSuperAdmin() && !can(tag.permission)) return false;
  if (tag.roles === 'admin' && aud !== 'admin') return false;
  return true;
}

/** "Shu sahifaga o'tish" is offered only where the menu would take you (§3.3). */
export function canOpen(href: string, teacherOnly: boolean): boolean {
  const path = href.split(/[?#]/)[0];
  if (path === '/profile' || path === '/help') return true;
  const item = NAV_ITEMS.find((i) => i.href === path);
  if (!item) return true;
  return visibleNavItems(item.section, teacherOnly).some((i) => i.href === path);
}

export interface VisibleSection extends Omit<HelpSection, 'questions'> {
  questions: HelpQuestion[];
  timeline?: HelpTimeline;
}

export interface VisibleHelp {
  audience: HelpAudience;
  /** Accordion rows in order; `lugat` is the glossary pseudo-section. */
  order: string[];
  sections: Map<string, VisibleSection>;
  glossary: HelpGlossaryItem[];
  errors: HelpErrorItem[];
  safe: HelpListItem[];
  irreversible: HelpListItem[];
  chips: HelpChip[];
  checklist: HelpChecklist | null;
  teacherBrief: HelpTeacherBrief | null;
  /** slug -> question + its section, for deep links / search / "Bog'liq". */
  questions: Map<string, { question: HelpQuestion; section: VisibleSection }>;
}

export function buildVisibleHelp(aud: HelpAudience): VisibleHelp {
  const vis = <T extends Partial<HelpTag>>(items: T[]) => items.filter((i) => isVisible(i, aud));
  const sections = new Map<string, VisibleSection>();
  const questions = new Map<string, { question: HelpQuestion; section: VisibleSection }>();

  for (const s of HELP_SECTIONS) {
    if (!isVisible(s, aud)) continue;
    const qs: HelpQuestion[] = s.questions
      .filter((q) => isVisible(q, aud))
      .map((q) => {
        if (!q.steps) return q as HelpQuestion;
        const steps = q.steps
          .filter((st) => typeof st === 'string' || isVisible(st, aud))
          .map((st) => (typeof st === 'string' ? st : st.text));
        return { ...q, steps: steps.length ? steps : undefined };
      });
    if (!qs.length) continue; // 0 savol -> bo'lim butunlay yashirin
    const tl = HELP_TIMELINES.find((t) => t.section === s.slug);
    const section: VisibleSection = {
      ...s,
      questions: qs,
      timeline: tl ? { ...tl, items: vis(tl.items) } : undefined,
    };
    sections.set(s.slug, section);
    for (const q of qs) questions.set(q.slug, { question: q, section });
  }

  const glossary = vis(HELP_GLOSSARY.items);
  const order = HELP_ORDER.filter((slug) => (slug === HELP_GLOSSARY.slug ? glossary.length > 0 : sections.has(slug)));
  const rawChecklist = HELP_CHECKLISTS[aud];
  // "Qanday?" only when its answer is visible to this user.
  const items = vis(rawChecklist.items).map((it) => (it.how && !questions.has(it.how) ? { ...it, how: undefined } : it));

  return {
    audience: aud,
    order,
    sections,
    glossary,
    errors: vis(HELP_ERRORS),
    safe: vis(HELP_SAFE_LIST.items),
    irreversible: vis(HELP_SAFE_LIST.irreversible),
    chips: HELP_CHIPS[aud].filter((c) => questions.has(c.slug)).slice(0, MAX_CHIPS),
    checklist: items.length
      ? {
          ...rawChecklist,
          items,
          // "6 qadam" follows what this user actually sees (§8.1).
          hint: rawChecklist.hint.replace(/\d+ qadam/, `${items.length} qadam`),
        }
      : null,
    teacherBrief: aud === 'admin' ? HELP_TEACHER_BRIEF : null,
    questions,
  };
}
