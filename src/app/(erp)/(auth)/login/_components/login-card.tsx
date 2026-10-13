'use client';

import { useState } from 'react';
import { Brand } from '@/components/layout/brand';
import { LangToggle } from './lang-toggle';
import { LoginForm } from './login-form';
import { LOGIN_TEXT, type Lang } from '@/lib/i18n/login';

/** The floating login card: brand + language switch + form. */
export function LoginCard() {
  const [lang, setLang] = useState<Lang>('uz');
  const t = LOGIN_TEXT[lang];

  return (
    <div className="w-[432px] max-w-full rounded-[30px] bg-background p-[42px_40px_34px] shadow-[-9px_-9px_22px_rgba(255,255,255,0.95),9px_9px_24px_rgba(163,177,198,0.55)]">
      <div className="mb-8 flex items-center justify-between">
        <Brand />
        <LangToggle lang={lang} onChange={setLang} />
      </div>
      <h1 className="mb-1.5 text-[26px] font-extrabold tracking-[-0.6px] text-foreground">{t.welcome}</h1>
      <p className="mb-[30px] text-[14px] text-muted">{t.subtitle}</p>
      <LoginForm t={t} />
    </div>
  );
}
