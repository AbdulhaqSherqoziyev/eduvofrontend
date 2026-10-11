/**
 * Qo'llanma (/help) data model — SPEC §13.1.
 * The data itself lives in `content.ts`, generated from docs/help/CONTENT.md
 * by `scripts/gen-help-content.mjs`. Do not hand-edit content.ts.
 */

export type HelpRoles = 'all' | 'admin' | 'teacher';
export type HelpRisk = 'safe' | 'careful' | 'irreversible';
export type HelpAudience = 'admin' | 'teacher';

/**
 * Who may see an item. `permission: '@manage'` is the "Tarif va modullar" rule
 * (`canViewModulesScreen()`), not a permission code.
 */
export interface HelpTag {
  roles: HelpRoles;
  module?: string;
  permission?: string;
}

export interface HelpLink {
  href: string;
  label: string;
}

export interface HelpQuestion extends HelpTag {
  slug: string;
  title: string;
  risk: HelpRisk;
  who: string;
  keywords: string[];
  answer: string;
  steps?: string[];
  /** Multi-line (`\n`). */
  example?: string;
  undo?: string;
  /** Multi-line (`\n`); `[...]` are fill-in placeholders. */
  parentReply?: string;
  link?: HelpLink;
  /** One entry per note line. */
  note?: string[];
  see?: string[];
}

export interface HelpSection extends HelpTag {
  slug: string;
  title: string;
  icon: string;
  intro: string;
  questions: HelpQuestion[];
  tip?: string;
}

/** A step with its own visibility tag (CONTENT: `4. text | roles: admin`). */
export interface HelpTaggedStep extends Partial<HelpTag> {
  text: string;
}

/** Question as generated — steps may still carry tags; `buildVisibleHelp` resolves them. */
export interface HelpQuestionData extends Omit<HelpQuestion, 'steps'> {
  steps?: (string | HelpTaggedStep)[];
}

export interface HelpSectionData extends Omit<HelpSection, 'questions'> {
  questions: HelpQuestionData[];
}

export interface HelpListItem extends Partial<HelpTag> {
  text: string;
}

export interface HelpTimelineItem extends HelpListItem {
  label: string;
}

export interface HelpTimeline {
  section: string;
  title: string;
  hint: string;
  items: HelpTimelineItem[];
}

export interface HelpChip {
  label: string;
  slug: string;
}

export interface HelpChecklistItem extends Partial<HelpTag> {
  id: string;
  title: string;
  desc: string;
  link?: string;
  how?: string;
}

export interface HelpChecklist {
  title: string;
  hint: string;
  items: HelpChecklistItem[];
}

export interface HelpTeacherBrief {
  title: string;
  hint: string;
  text: string;
}

export interface HelpSafeList {
  title: string;
  hint: string;
  items: HelpListItem[];
  irreversibleTitle: string;
  irreversible: HelpListItem[];
}

export interface HelpGlossaryItem extends Partial<HelpTag> {
  slug: string;
  term: string;
  text: string;
}

export interface HelpErrorItem extends Partial<HelpTag> {
  message: string;
  text: string;
}

export interface HelpGlossary {
  slug: string;
  title: string;
  items: HelpGlossaryItem[];
}
