'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ChevronDown, Circle, X } from 'lucide-react';
import { NmButton } from '@/components/ui/nm-button';
import { NmCard } from '@/components/ui/nm-card';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { cn } from '@/lib/utils/cn';
import { getSessionUser } from '@/lib/auth/session';
import { CHECKLIST_STORAGE_PREFIX } from '@/lib/help/constants';
import type { HelpChecklist } from '@/lib/help/types';
import { Rich } from './rich-text';
import { FOCUS, SOFT, TONE_TEXT } from './styles';

interface Stored {
  done: string[];
  hidden: boolean;
  collapsed?: boolean;
}

function storageKey(): string {
  const u = getSessionUser();
  return `${CHECKLIST_STORAGE_PREFIX}${u?.tenantId ?? 't'}:${u?.userId ?? 'u'}`;
}

/**
 * Ticks + hidden state in localStorage (§8.3). Every access is guarded: a
 * private window or blocked storage just means nothing is remembered.
 */
export function useChecklistState() {
  const [state, setState] = useState<Stored>({ done: [], hidden: false });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey());
      if (!raw) return;
      const v = JSON.parse(raw) as Partial<Stored>;
      setState({
        done: Array.isArray(v.done) ? v.done.filter((x): x is string => typeof x === 'string') : [],
        hidden: v.hidden === true,
        collapsed: typeof v.collapsed === 'boolean' ? v.collapsed : undefined,
      });
    } catch {
      // unreadable -> start fresh
    }
  }, []);

  const update = useCallback((fn: (s: Stored) => Stored) => {
    setState((prev) => {
      const next = fn(prev);
      try {
        window.localStorage.setItem(storageKey(), JSON.stringify(next));
      } catch {
        // storage blocked -> keep it for this visit only
      }
      return next;
    });
  }, []);

  return {
    state,
    toggle: (id: string) =>
      update((s) => ({ ...s, done: s.done.includes(id) ? s.done.filter((d) => d !== id) : [...s.done, id] })),
    hide: () => update((s) => ({ ...s, hidden: true })),
    show: () => update((s) => ({ ...s, hidden: false, collapsed: false })),
    setCollapsed: (collapsed: boolean) => update((s) => ({ ...s, collapsed })),
  };
}

export type ChecklistState = ReturnType<typeof useChecklistState>;

interface Props {
  checklist: HelpChecklist;
  cl: ChecklistState;
  /** Mobile/tablet copy: starts collapsed to one row (§8.2). */
  collapsible: boolean;
  canOpenHref: (href: string) => boolean;
  onHow: (slug: string) => void;
  idSuffix: string;
}

/** "Birinchi kun" / "Ilovaga birinchi kirish" — no percent, no progress bar (§8). */
export function FirstDayChecklist({ checklist, cl, collapsible, canOpenHref, onHow, idSuffix }: Props) {
  const [showDone, setShowDone] = useState(false);
  const { done, hidden } = cl.state;
  if (hidden) return null;

  const collapsed = collapsible && (cl.state.collapsed ?? true);
  const allDone = checklist.items.every((i) => done.includes(i.id));
  const listId = `checklist-${idSuffix}`;

  const header = (
    <div className="flex items-start gap-2">
      {collapsible ? (
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-controls={listId}
          onClick={() => cl.setCollapsed(!collapsed)}
          className={cn('-m-1 flex min-h-[44px] flex-1 items-center gap-2 rounded-[12px] p-1 text-left', FOCUS)}
        >
          <span className="flex-1 text-[16px] font-extrabold text-foreground">{checklist.title}</span>
          <ChevronDown
            className={cn('size-5 shrink-0 transition-transform motion-reduce:transition-none', SOFT, !collapsed && 'rotate-180')}
            aria-hidden
          />
        </button>
      ) : (
        <h2 className="flex-1 pt-2 text-[16px] font-extrabold text-foreground">{checklist.title}</h2>
      )}
      <NmIconButton aria-label="Yashirish" onClick={cl.hide} className={cn('size-11 shrink-0', FOCUS)}>
        <X className="size-4" aria-hidden />
      </NmIconButton>
    </div>
  );

  if (allDone && !showDone) {
    return (
      <NmCard className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <CheckCircle2 className={cn('size-5 shrink-0', TONE_TEXT.green)} aria-hidden />
          <span className="flex-1 text-[14px] font-bold text-foreground">{checklist.title} ro&apos;yxati bajarildi.</span>
          <NmButton variant="ghost" size="sm" className={cn('h-11', FOCUS)} onClick={() => setShowDone(true)}>
            Ko&apos;rsatish
          </NmButton>
          <NmIconButton aria-label="Yashirish" onClick={cl.hide} className={cn('size-11 shrink-0', FOCUS)}>
            <X className="size-4" aria-hidden />
          </NmIconButton>
        </div>
      </NmCard>
    );
  }

  return (
    <NmCard className="p-5">
      {header}
      {!collapsed ? (
        <div id={listId}>
          <p className={cn('mt-1 text-[13px] font-semibold leading-[1.5]', SOFT)}>{checklist.hint}</p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {checklist.items.map((it) => {
              const isDone = done.includes(it.id);
              return (
                <li key={it.id} className="flex gap-2 rounded-[14px] bg-background p-2.5 pr-3.5 shadow-nm-sm">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isDone}
                    aria-label={it.title}
                    onClick={() => cl.toggle(it.id)}
                    className={cn('flex size-11 shrink-0 items-center justify-center rounded-full', FOCUS)}
                  >
                    {isDone ? (
                      <CheckCircle2 className={cn('size-6', TONE_TEXT.green)} aria-hidden />
                    ) : (
                      <Circle className="size-6 text-muted" aria-hidden />
                    )}
                  </button>
                  <div className="min-w-0 flex-1 pt-2.5">
                    <div className={cn('break-words text-[14px] font-bold leading-[1.4]', isDone ? SOFT : 'text-foreground')}>
                      <Rich text={it.title} />
                    </div>
                    <div className={cn('mt-0.5 break-words text-[12.5px] font-medium leading-[1.45]', SOFT)}>
                      <Rich text={it.desc} />
                    </div>
                    <div className="flex flex-wrap gap-x-5">
                      {it.link ? (
                        canOpenHref(it.link) ? (
                          <Link
                            href={it.link}
                            className={cn(
                              'inline-flex min-h-[44px] items-center gap-1 rounded-[8px] text-[13px] font-bold text-primary',
                              FOCUS,
                            )}
                          >
                            Ochish <ArrowRight className="size-3.5" aria-hidden />
                          </Link>
                        ) : (
                          <span className={cn('inline-flex min-h-[44px] items-center text-[13px] font-semibold', SOFT)}>
                            Administrator bajaradi
                          </span>
                        )
                      ) : null}
                      {it.how ? (
                        <button
                          type="button"
                          onClick={() => onHow(it.how!)}
                          className={cn('inline-flex min-h-[44px] items-center rounded-[8px] text-[13px] font-bold text-primary', FOCUS)}
                        >
                          Qanday?
                        </button>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </NmCard>
  );
}
