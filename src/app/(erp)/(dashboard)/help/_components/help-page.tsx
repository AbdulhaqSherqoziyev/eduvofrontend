'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Info, SearchX } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/shared/skeleton';
import { NmButton } from '@/components/ui/nm-button';
import { NmCard } from '@/components/ui/nm-card';
import { cn } from '@/lib/utils/cn';
import { useModuleGateVersion } from '@/lib/hooks/use-module-gate';
import { useTenantFlags, useTenantSettings } from '@/lib/hooks/use-tenant-settings';
import { HELP_GLOSSARY } from '@/lib/help/content';
import { HIGHLIGHT_MS, SEARCH_DEBOUNCE_MS, SUPPORT_TEXT } from '@/lib/help/constants';
import { buildIndex, norm, search } from '@/lib/help/search';
import type { HelpQuestion } from '@/lib/help/types';
import { buildVisibleHelp, canOpen, helpAudience } from '@/lib/help/visibility';
import { ContactCard } from './contact-card';
import { ErrorRow } from './errors-list';
import { FirstDayChecklist, useChecklistState } from './first-day-checklist';
import { GlossaryList } from './glossary-list';
import { CHIP, HelpChips } from './help-chips';
import { HelpSearch } from './help-search';
import { QuestionCard } from './question-card';
import { SafeListCard } from './safe-list-card';
import { SectionAccordion } from './section-accordion';
import { FOCUS, LABEL, SOFT } from './styles';

const MISSING_LINK =
  "Bu havoladagi savol sizning menyuingizda yo'q bo'limga tegishli yoki o'zgartirilgan. Kerak bo'lsa administratoringizdan so'rang.";
const NOT_FOUND_HINT = 'Savolingizni markazingiz administratoriga yoki direktoriga yozing.';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function setHash(slug: string | null) {
  const url = `${window.location.pathname}${window.location.search}${slug ? `#${slug}` : ''}`;
  window.history.replaceState(null, '', url);
}

/** Owns search, the open section/question, deep links and the checklist state. */
export function HelpPage() {
  const settings = useTenantSettings();
  const { teacherOnlyMode } = useTenantFlags();
  const gateVersion = useModuleGateVersion();

  // Session + module gate live in localStorage: render nothing user-specific on the server.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const ready = mounted && !settings.isLoading;
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setSlow(true), 300);
    return () => window.clearTimeout(t);
  }, []);

  const help = useMemo(
    () => (ready ? buildVisibleHelp(helpAudience(teacherOnlyMode)) : null),
    // gateVersion: the module gate is read synchronously inside
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, teacherOnlyMode, gateVersion],
  );
  const index = useMemo(() => (help ? buildIndex(help) : null), [help]);

  // ---- search
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  useEffect(() => {
    const t = window.setTimeout(() => setQuery(input), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [input]);
  const searching = norm(query).length >= 2;
  const results = useMemo(() => (searching && index ? search(index, query) : null), [searching, index, query]);
  const searchRef = useRef<HTMLInputElement>(null);

  // ---- accordion + deep links
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [instant, setInstant] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const pendingScroll = useRef<{ id: string; focus?: string } | null>(null);
  const hlTimer = useRef<number>();

  const cl = useChecklistState();

  const scrollSoon = (id: string, focus?: string) => {
    pendingScroll.current = { id, focus };
  };

  // Scroll after the commit that mounted the target (previous section already closed).
  useEffect(() => {
    const p = pendingScroll.current;
    if (!p) return;
    pendingScroll.current = null;
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(p.id);
      if (!el) return;
      el.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
      if (p.focus) document.getElementById(p.focus)?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  });

  const flash = (slug: string) => {
    window.clearTimeout(hlTimer.current);
    setHighlight(slug);
    hlTimer.current = window.setTimeout(() => setHighlight(null), HIGHLIGHT_MS);
  };
  useEffect(() => () => window.clearTimeout(hlTimer.current), []);

  /** §9 — the single entry point for hash, chips, "Bog'liq" and "Qanday?". */
  const goTo = useCallback(
    (slug: string) => {
      if (!help) return;
      const hit = help.questions.get(slug);
      if (hit) {
        setInput('');
        setQuery('');
        setMissing(false);
        setInstant(true);
        setOpenSection(hit.section.slug);
        setOpenQuestion(slug);
        setHash(slug);
        scrollSoon(`q-${slug}`, `qb-${slug}`);
        flash(slug);
        return;
      }
      if (help.order.includes(slug)) {
        setInput('');
        setQuery('');
        setMissing(false);
        setInstant(true);
        setOpenSection(slug);
        setOpenQuestion(null);
        scrollSoon(`sec-head-${slug}`, `sec-btn-${slug}`);
        return;
      }
      if (help.glossary.some((g) => g.slug === slug)) {
        setInput('');
        setQuery('');
        setMissing(false);
        setInstant(true);
        setOpenSection(HELP_GLOSSARY.slug);
        setOpenQuestion(null);
        scrollSoon(slug);
        flash(slug);
        return;
      }
      setMissing(true);
    },
    [help],
  );

  // Initial hash + later hash changes (a pasted link in the same tab).
  const handledInitial = useRef(false);
  useEffect(() => {
    if (!help) return;
    const fromHash = () => {
      let slug = '';
      try {
        slug = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        slug = window.location.hash.slice(1);
      }
      if (slug) goTo(slug);
    };
    if (!handledInitial.current) {
      handledInitial.current = true;
      fromHash();
    }
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [help, goTo]);

  // "/" focuses the search (desktop), unless typing somewhere already.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleSection = (slug: string) => {
    setInstant(false);
    if (openSection === slug) {
      setOpenSection(null);
      if (openQuestion) setHash(null);
      setOpenQuestion(null);
      return;
    }
    setOpenSection(slug);
    if (openQuestion) setHash(null);
    setOpenQuestion(null);
    scrollSoon(`sec-head-${slug}`);
  };

  const toggleQuestion = (slug: string) => {
    if (openQuestion === slug) {
      setOpenQuestion(null);
      setHash(null);
      return;
    }
    setOpenQuestion(slug);
    setHash(slug);
    scrollSoon(`q-${slug}`);
  };

  const canOpenHref = useCallback((href: string) => canOpen(href, teacherOnlyMode), [teacherOnlyMode]);

  // ---- loading (§14): only while session/tenant flags are unknown, and only if slow
  if (!help || !index) {
    if (!slow) return null;
    return (
      <div className="flex max-w-[860px] flex-col gap-4" aria-busy="true" aria-label="Yuklanmoqda">
        <Skeleton className="h-[50px] w-full" />
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[44px] w-[130px] rounded-full" />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[60px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  const renderQuestion = (q: HelpQuestion, sectionTitle?: string) => (
    <QuestionCard
      key={q.slug}
      question={q}
      open={openQuestion === q.slug}
      onToggle={() => toggleQuestion(q.slug)}
      highlight={highlight === q.slug}
      sectionTitle={sectionTitle}
      units={results?.units}
      showParentReply={help.audience === 'admin'}
      canOpenLink={q.link ? canOpenHref(q.link.href) : false}
      related={(q.see ?? [])
        .map((s) => help.questions.get(s))
        .filter((x): x is NonNullable<typeof x> => !!x)
        .map((x) => ({ slug: x.question.slug, title: x.question.title }))}
      onGoTo={goTo}
    />
  );

  const hasContent = help.order.length > 0;
  const checklist = help.checklist;
  const totalFound = results ? results.questions.length + results.errors.length + results.glossary.length : 0;

  return (
    <div className="grid grid-cols-1 items-start gap-[22px] pb-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-w-0 max-w-[860px] flex-col gap-4">
        <div className="sticky top-0 z-10 -mb-1 bg-background pb-3 pt-0.5 xl:static xl:mb-0 xl:pb-0">
          <HelpSearch ref={searchRef} value={input} onChange={setInput} />
        </div>

        {missing ? (
          <NmCard inset className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start">
            <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <p className="flex-1 text-[13.5px] font-semibold leading-[1.55] text-foreground">{MISSING_LINK}</p>
            <NmButton variant="ghost" size="sm" className={cn('h-11 self-end sm:self-auto', FOCUS)} onClick={() => setMissing(false)}>
              Yopish
            </NmButton>
          </NmCard>
        ) : null}

        {results ? (
          <div className="flex flex-col gap-3">
            <p aria-live="polite" className={cn('text-[13px] font-bold', SOFT)}>
              &ldquo;{query.trim()}&rdquo; bo&apos;yicha {totalFound} ta javob
            </p>
            {totalFound === 0 ? (
              <EmptyState
                icon={<SearchX className="size-6" />}
                title="Bunday savol hali yo'q"
                action={
                  <div className="flex max-w-md flex-col items-center gap-3">
                    <p className={cn('text-[13px] font-medium leading-[1.5]', SOFT)}>{NOT_FOUND_HINT}</p>
                    {help.chips.length ? (
                      <>
                        <p className="text-[13px] font-bold text-foreground">Balki shular kerakdir:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {help.chips.slice(0, 3).map((c) => (
                            <button key={c.slug} type="button" onClick={() => goTo(c.slug)} className={cn(CHIP, FOCUS)}>
                              {c.label}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : null}
                    <p className={cn('text-[12.5px] font-medium', SOFT)}>
                      Boshqacha yozib ko&apos;ring: masalan, &ldquo;to&apos;lov&rdquo; o&apos;rniga &ldquo;pul&rdquo;.
                    </p>
                  </div>
                }
              />
            ) : null}
            {results.questions.length ? (
              <div className="flex flex-col gap-2.5">
                {results.questions.map(({ question, section }) => renderQuestion(question, section.title))}
              </div>
            ) : null}
            {results.errors.length ? (
              <div className="mt-2">
                <div className={cn('mb-2', LABEL)}>Ekrandagi xabar</div>
                <ul className="flex flex-col gap-2.5">
                  {results.errors.map((e) => (
                    <ErrorRow key={e.message} item={e} units={results.units} />
                  ))}
                </ul>
              </div>
            ) : null}
            {results.glossary.length ? (
              <div className="mt-2">
                <div className={cn('mb-1', LABEL)}>Lug&apos;atda</div>
                <NmCard className="p-2">
                  <GlossaryList items={results.glossary} units={results.units} />
                </NmCard>
              </div>
            ) : null}
          </div>
        ) : hasContent ? (
          <>
            <HelpChips chips={help.chips} onPick={goTo} />
            {checklist ? (
              <div className="xl:hidden">
                <FirstDayChecklist
                  checklist={checklist}
                  cl={cl}
                  collapsible
                  canOpenHref={canOpenHref}
                  onHow={goTo}
                  idSuffix="m"
                />
              </div>
            ) : null}
            <SectionAccordion
              order={help.order}
              sections={help.sections}
              glossary={help.glossary}
              glossaryTitle={HELP_GLOSSARY.title}
              errors={help.errors}
              openSection={openSection}
              instant={instant}
              onToggleSection={toggleSection}
              highlight={highlight}
              renderQuestion={(q) => renderQuestion(q)}
              teacherBrief={help.teacherBrief}
              hiddenChecklist={checklist && cl.state.hidden ? checklist : null}
              onShowChecklist={cl.show}
            />
          </>
        ) : (
          <EmptyState title="Qo'llanma hozircha bo'sh" hint={SUPPORT_TEXT} />
        )}

        <div className="flex flex-col gap-4 xl:hidden">
          <SafeListCard safe={help.safe} irreversible={help.irreversible} />
          <ContactCard />
        </div>
      </div>

      <aside className="hidden flex-col gap-[18px] xl:sticky xl:top-0 xl:-my-3 xl:-ml-3 xl:flex xl:max-h-[calc(100vh-150px)] xl:overflow-y-auto xl:py-3 xl:pl-3 xl:pr-1.5">
        {checklist && !results ? (
          <FirstDayChecklist
            checklist={checklist}
            cl={cl}
            collapsible={false}
            canOpenHref={canOpenHref}
            onHow={goTo}
            idSuffix="d"
          />
        ) : null}
        <SafeListCard safe={help.safe} irreversible={help.irreversible} />
        <ContactCard />
      </aside>
    </div>
  );
}
