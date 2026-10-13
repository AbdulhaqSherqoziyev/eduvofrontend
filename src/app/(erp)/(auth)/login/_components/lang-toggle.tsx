'use client';

import { NmSegmented } from '@/components/ui/nm-segmented';
import type { Lang } from '@/lib/i18n/login';

interface LangToggleProps {
  lang: Lang;
  onChange: (lang: Lang) => void;
}

/** Compact UZ / RU language switch for the login card. */
export function LangToggle({ lang, onChange }: LangToggleProps) {
  return (
    <NmSegmented
      className="h-[38px] w-[94px]"
      size="sm"
      value={lang}
      onValueChange={(v) => onChange(v as Lang)}
      items={[
        { value: 'uz', label: 'UZ' },
        { value: 'ru', label: 'RU' },
      ]}
    />
  );
}
