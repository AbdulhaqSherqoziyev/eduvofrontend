'use client';

import type { LucideIcon } from 'lucide-react';

export interface TabDef<K extends string = string> {
  key: K;
  label: string;
  icon: LucideIcon;
}

/**
 * Bottom navigation for the installed app (portal and /t share it).
 *
 * Every tab carries its word, not only a glyph: a parent who opens this twice a
 * month should not have to decode icons. The active one is stated twice — by
 * colour and by the pressed-in background — so colour is never the only signal.
 */
export function PortalTabBar<K extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef<K>[];
  active: K;
  onChange: (key: K) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 bg-surface shadow-nm pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-14 max-w-3xl items-stretch">
        {tabs.map((t) => {
          const on = t.key === active;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              aria-current={on ? 'page' : undefined}
              onClick={() => onChange(t.key)}
              className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 ${
                on ? 'text-primary' : 'text-muted'
              }`}
            >
              <span
                className={`flex size-7 items-center justify-center rounded-full ${
                  on ? 'bg-background shadow-nm-inset-sm' : ''
                }`}
              >
                <Icon className="size-5" strokeWidth={on ? 2.4 : 2} />
              </span>
              <span className="text-[10.5px] font-bold leading-none">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
