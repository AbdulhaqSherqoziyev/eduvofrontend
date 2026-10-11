'use client';

import { useEffect, useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import { NmButton } from '@/components/ui/nm-button';
import { NmCard } from '@/components/ui/nm-card';
import { cn } from '@/lib/utils/cn';
import { helpIcon } from '@/lib/help/icons';
import type { HelpChecklist, HelpGlossaryItem, HelpQuestion, HelpTeacherBrief } from '@/lib/help/types';
import type { VisibleSection } from '@/lib/help/visibility';
import { ContactCard } from './contact-card';
import { ErrorsList } from './errors-list';
import { GlossaryList } from './glossary-list';
import { TeacherBriefCard } from './teacher-brief-card';
import { TimelineCard } from './timeline-card';
import { TipCard } from './tip-card';
import { FOCUS, SCROLL_MT, SOFT } from './styles';
import type { HelpErrorItem } from '@/lib/help/types';

const GLOSSARY_SLUG = 'lugat';

/** Open animation only; closing is instant so the next scroll lands right (§6.3). */
function Reveal({ animate, children }: { animate: boolean; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(!animate);
  useEffect(() => {
    if (expanded) return;
    const id = requestAnimationFrame(() => setExpanded(true));
    return () => cancelAnimationFrame(id);
  }, [expanded]);
  return (
    <div
      className={cn(
        'grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none',
        expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

export interface SectionAccordionProps {
  order: string[];
  sections: Map<string, VisibleSection>;
  glossary: HelpGlossaryItem[];
  glossaryTitle: string;
  errors: HelpErrorItem[];
  openSection: string | null;
  /** Set when the section was opened by a deep link — no animation, so scroll is exact. */
  instant: boolean;
  onToggleSection: (slug: string) => void;
  highlight: string | null;
  renderQuestion: (q: HelpQuestion) => React.ReactNode;
  teacherBrief: HelpTeacherBrief | null;
  /** Checklist hidden with ✕ -> offer it back in "Birinchi qadamlar" (§8.2). */
  hiddenChecklist: HelpChecklist | null;
  onShowChecklist: () => void;
}

/** Two-level accordion, one open section at a time (§6). */
export function SectionAccordion(props: SectionAccordionProps) {
  const { order, sections, glossary, glossaryTitle, openSection, onToggleSection } = props;
  return (
    <NmCard className="p-2">
      <div className="divide-y divide-[rgba(163,177,198,0.22)] dark:divide-[rgba(255,255,255,0.05)]">
        {order.map((slug) => {
          const isGlossary = slug === GLOSSARY_SLUG;
          const section = sections.get(slug);
          if (!isGlossary && !section) return null;
          const open = openSection === slug;
          const Icon = isGlossary ? BookOpen : helpIcon(section!.icon);
          const title = isGlossary ? glossaryTitle : section!.title;
          const count = isGlossary
            ? `${glossary.length} ta atama`
            : slug === 'yordam'
              ? null
              : `${section!.questions.length} ta savol`;
          return (
            <div key={slug} className="py-1 first:pt-0 last:pb-0">
              <h2 id={`sec-head-${slug}`} className={SCROLL_MT}>
                <button
                  type="button"
                  id={`sec-btn-${slug}`}
                  aria-expanded={open}
                  aria-controls={`sec-${slug}`}
                  onClick={() => onToggleSection(slug)}
                  className={cn(
                    'flex min-h-[60px] w-full items-center gap-3.5 rounded-[16px] px-3.5 py-3 text-left hover:bg-[rgba(46,107,230,0.05)]',
                    FOCUS,
                    open && 'shadow-nm-inset',
                  )}
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-background text-primary shadow-nm-inset-sm">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-3">
                    <span className="min-w-0 flex-1 break-words text-[15.5px] font-extrabold tracking-[-0.2px] text-foreground">
                      {title}
                    </span>
                    {count ? (
                      <span className={cn('shrink-0 text-[12.5px] font-semibold', SOFT)}>{count}</span>
                    ) : null}
                  </span>
                  <ChevronDown
                    className={cn('size-5 shrink-0 transition-transform motion-reduce:transition-none', SOFT, open && 'rotate-180')}
                    aria-hidden
                  />
                </button>
              </h2>
              {open ? (
                <div id={`sec-${slug}`} role="region" aria-labelledby={`sec-btn-${slug}`}>
                  <Reveal animate={!props.instant}>
                    <div className="px-2 pb-3 pt-1 md:px-3">
                      {isGlossary ? (
                        <GlossaryList items={glossary} highlight={props.highlight} />
                      ) : (
                        <SectionBody {...props} section={section!} />
                      )}
                    </div>
                  </Reveal>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </NmCard>
  );
}

function SectionBody({
  section, renderQuestion, teacherBrief, hiddenChecklist, onShowChecklist, errors,
}: SectionAccordionProps & { section: VisibleSection }) {
  const isHelp = section.slug === 'yordam';
  return (
    <>
      <p className={cn('text-[13.5px] font-semibold leading-[1.5]', SOFT)}>{section.intro}</p>
      {section.slug === 'birinchi-qadamlar' && hiddenChecklist ? (
        <NmButton variant="ghost" size="sm" className={cn('mt-1 h-11 px-0', FOCUS)} onClick={onShowChecklist}>
          {hiddenChecklist.title} ro&apos;yxatini ko&apos;rsatish
        </NmButton>
      ) : null}
      {section.timeline ? <TimelineCard timeline={section.timeline} /> : null}
      {isHelp ? <ContactCard className="mt-3" /> : null}
      <div className="mt-3 flex flex-col gap-2.5">
        {section.questions.map((q) => (
          <div key={q.slug} className="flex flex-col gap-2.5">
            {renderQuestion(q)}
            {q.slug === 'ilovaga-birinchi-kirish' && teacherBrief ? <TeacherBriefCard brief={teacherBrief} /> : null}
          </div>
        ))}
      </div>
      {isHelp ? <ErrorsList items={errors} /> : null}
      {section.tip ? <TipCard text={section.tip} /> : null}
    </>
  );
}
