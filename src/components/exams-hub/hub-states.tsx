'use client';
/** §2 state cards (error / module off / not found / empty) and the delayed skeleton. */
import { BookOpen, Lock, SearchX, WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { NmButton } from '@/components/ui/nm-button';
import { NmCard } from '@/components/ui/nm-card';
import { NmSkeleton } from '@/components/ui/nm-skeleton';
import { isModuleOff, needsLogin, errCode } from '@/lib/exam/hub-api';
import { ht } from '@/lib/exam/i18n/hub';
import { useDelayed } from '@/lib/exam/use-hub';

interface StateProps {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: { label: string; on: () => void; primary?: boolean };
}

export function StateCard({ icon, title, body, action }: StateProps) {
  return (
    <NmCard className="mx-auto flex w-full max-w-[520px] flex-col items-center gap-3 p-7 text-center">
      {icon}
      <div className="text-[17px] font-extrabold text-foreground">{title}</div>
      {body ? <p className="text-[14px] font-medium leading-[1.6] text-[#5b6b82]">{body}</p> : null}
      {action ? (
        <NmButton variant={action.primary ? 'primary' : 'soft'} className="mt-1" onClick={action.on}>
          {action.label}
        </NmButton>
      ) : null}
    </NmCard>
  );
}

/** Every hub query failure goes through here: login, module off, not found, network. */
export function HubError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const router = useRouter();
  const toLogin = needsLogin(error);
  // A PIN session only reaches its own assignment; the hub routes it there.
  const limited = errCode(error) === 'CODE_SESSION_LIMITED';
  useEffect(() => {
    if (toLogin) router.replace('/exams/login');
    else if (limited) router.replace('/exams');
  }, [toLogin, limited, router]);
  if (toLogin || limited) return null;
  if (isModuleOff(error)) {
    return (
      <StateCard
        icon={<Lock className="size-7 text-muted" aria-hidden />}
        title={ht('hubx.module_off_title')}
        body={ht('hubx.module_off_body')}
        action={{ label: ht('hubx.back_cabinet'), on: () => router.push('/portal') }}
      />
    );
  }
  if (errCode(error) === 'EXAM_NOT_FOUND') {
    return (
      <StateCard
        icon={<SearchX className="size-7 text-muted" aria-hidden />}
        title={ht('hubx.not_found')}
        body=""
        action={{ label: ht('hubx.exams_list'), on: () => router.push('/exams') }}
      />
    );
  }
  return (
    <StateCard
      icon={<WifiOff className="size-7 text-[#E4574C]" aria-hidden />}
      title={ht('hubx.err_title')}
      body={ht('hubx.err_body')}
      action={{ label: ht('hubx.retry'), on: onRetry, primary: true }}
    />
  );
}

export function NoExams() {
  const router = useRouter();
  return (
    <StateCard
      icon={<BookOpen className="size-8 text-muted" aria-hidden />}
      title={ht('hubx.empty_title')}
      body={ht('hubx.empty_body')}
      action={{ label: ht('hubx.back_cabinet'), on: () => router.push('/portal') }}
    />
  );
}

/** Nothing for 300 ms, then the skeleton (§2 "300 ms dan oldin skeleton chiqmaydi"). */
export function Delayed({ children }: { children: React.ReactNode }) {
  const show = useDelayed(true);
  return show ? <div aria-busy="true">{children}</div> : null;
}

export function SkeletonBlock({ h, className }: { h: number; className?: string }) {
  return <NmSkeleton h={h} className={className ?? 'rounded-[24px]'} />;
}
