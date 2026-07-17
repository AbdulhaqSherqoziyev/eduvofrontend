'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const KEY = 'eduvo_theme';

/** Light/dark switcher — persists to localStorage, toggles the html.dark class. */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem(KEY, next ? 'dark' : 'light'); } catch { /* private mode */ }
  };

  return (
    <button
      type="button"
      aria-label={dark ? "Kunduzgi rejim" : "Tungi rejim"}
      onClick={toggle}
      className="flex size-11 flex-shrink-0 items-center justify-center rounded-[13px] bg-background text-[#5b6b82] shadow-nm-sm nm-pressable"
    >
      {dark ? <Sun className="size-5" strokeWidth={2} /> : <Moon className="size-5" strokeWidth={2} />}
    </button>
  );
}
