'use client';
/**
 * ExamsShell (§1): light v3 layout for /exams/*. No session → /exams/login;
 * the login page itself is drawn without the header (§7).
 */
import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ht } from '@/lib/exam/i18n/hub';
import { clearCodeSession, examStudentToken } from '@/lib/exam/session';
import { useHubIdentity } from '@/lib/exam/use-hub';
import { ExamsHeader } from './exams-header';

export function ExamsFooter() {
  return (
    <footer className="mt-7 text-[12px] font-semibold leading-[1.55] text-[#9aa6b8]">
      {ht('hubx.footer')} {ht('results.disclaimer')}
    </footer>
  );
}

export function ExamsShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const qc = useQueryClient();
  const isLogin = path === '/exams/login';
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const id = useHubIdentity();

  useEffect(() => {
    const ok = !!examStudentToken();
    setHasToken(ok);
    if (!ok && !isLogin) router.replace('/exams/login');
  }, [isLogin, path, router]);

  if (isLogin) return <main className="min-h-screen bg-background">{children}</main>;
  if (!hasToken || !id.ready) return <main className="min-h-screen bg-background" />;

  const signOut = () => {
    clearCodeSession();
    qc.removeQueries({ queryKey: ['exams-hub'] });
    router.replace('/exams/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <ExamsHeader name={id.fullName} codeMode={!!id.codeSession} onSignOut={signOut} />
      <main className="mx-auto flex max-w-[1240px] flex-col gap-[22px] px-4 pb-10 pt-7 md:px-[22px]">
        {children}
        <ExamsFooter />
      </main>
    </div>
  );
}
