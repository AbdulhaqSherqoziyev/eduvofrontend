'use client';
/** §1 header: brand · Imtihonlar/Natijalarim · "Markaz tayinlagan" · name · back (or "Chiqish" for PIN sessions). */
import { ArrowLeft, CalendarCheck, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { NmButton } from '@/components/ui/nm-button';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { ht } from '@/lib/exam/i18n/hub';

function initials(name: string | null) {
  if (!name) return '';
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');
}

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#5B8DEF] to-[#2E6BE6] text-[16px] font-extrabold text-white">E</span>
      <span className="truncate text-[15px] font-extrabold text-foreground">
        Eduvo<span className="font-semibold text-muted max-[420px]:hidden">{ht('hubx.brand_sub')}</span>
      </span>
    </div>
  );
}

function Who({ name }: { name: string | null }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[rgba(46,107,230,0.12)] text-[12px] font-extrabold text-primary" aria-hidden>
        {initials(name)}
      </span>
      <span className="truncate text-[13.5px] font-bold text-foreground max-[767px]:hidden">{name}</span>
    </div>
  );
}

export function AssignedPill() {
  return (
    <span className="inline-flex h-[34px] items-center gap-1.5 rounded-[17px] px-3.5 text-[13px] font-bold text-[#5b6b82] shadow-nm-inset-sm">
      <CalendarCheck className="size-4" aria-hidden />
      {ht('hub.assigned_by_center')}
    </span>
  );
}

export function ExamsHeader({ name, codeMode, onSignOut }: { name: string | null; codeMode: boolean; onSignOut: () => void }) {
  const path = usePathname();
  const router = useRouter();
  const tab = path.startsWith('/exams/progress') ? '/exams/progress' : '/exams';
  const tabs = [
    { value: '/exams', label: ht('hubx.tab_exams') },
    { value: '/exams/progress', label: ht('hubx.tab_progress') },
  ];
  const back = codeMode
    ? { icon: <LogOut className="size-4" aria-hidden />, label: ht('hubx.sign_out'), on: onSignOut }
    : { icon: <ArrowLeft className="size-4" aria-hidden />, label: ht('hubx.back_cabinet'), on: () => router.push('/portal') };
  const seg = codeMode ? null : <NmSegmented size="sm" items={tabs} value={tab} onValueChange={(v) => router.push(v)} className="w-full md:w-[280px]" />;

  return (
    <header className="border-b border-[rgba(163,177,198,0.35)] bg-background">
      {/* desktop */}
      <div className="mx-auto hidden h-16 max-w-[1240px] items-center gap-5 px-[22px] md:flex">
        <Brand />
        <div className="flex flex-1 justify-center">{seg}</div>
        <div className="flex items-center gap-3.5">
          <AssignedPill />
          <Who name={name} />
          <NmButton variant="ghost" size="sm" onClick={back.on}>
            {back.icon}
            {back.label}
          </NmButton>
        </div>
      </div>
      {/* mobile */}
      <div className="flex flex-col gap-3 px-4 pb-3 md:hidden">
        <div className="flex h-14 items-center gap-3">
          <div className="min-w-0 flex-1"><Brand /></div>
          <Who name={name} />
          <button type="button" aria-label={back.label} onClick={back.on} className="flex size-10 items-center justify-center rounded-[12px] bg-background text-muted shadow-nm-sm nm-pressable">
            {back.icon}
          </button>
        </div>
        {seg}
        <div><AssignedPill /></div>
      </div>
    </header>
  );
}
