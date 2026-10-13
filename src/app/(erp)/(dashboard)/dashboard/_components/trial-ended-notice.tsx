'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Info, X } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { getSessionUser } from '@/lib/auth/session';
import { trialJustEnded, useModulesOverview } from '@/lib/hooks/use-modules';

const DIRECTOR_TEXT =
  "Sinov davri tugadi. Sinovda ochiq bo'lgan bo'limlar yopildi — ma'lumot saqlanadi, istalgan vaqtda yoqasiz.";
// Staff cannot switch a module back on, so promising they can would be a
// commitment the product does not let them keep.
const STAFF_TEXT =
  "Sinov davri tugadi. Sinovda ochiq bo'lgan bo'limlar yopildi — ma'lumot saqlanadi. Kerak bo'lsa markaz rahbari qayta yoqadi.";

function seenKey(): string {
  const user = getSessionUser();
  return `ers_trial_end_seen_${user?.tenantId ?? 'x'}_${user?.userId ?? 'x'}`;
}

/**
 * The single most dangerous moment in modular pricing: on day 15 four sections
 * quietly vanish from the sidebar and the director concludes the system broke
 * or the data is gone.
 *
 * This is the explanation for that — and only that. One-off, dismissible, gone
 * by itself after seven days, with no price, no module list and no upgrade
 * offer. It is not the standing "you don't have X" banner the spec bans (§B.9):
 * it reports a change that already happened and never comes back.
 */
export function TrialEndedNotice() {
  const router = useRouter();
  const { data } = useModulesOverview();
  // Read after mount: localStorage during render would desync hydration.
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(window.localStorage.getItem(seenKey()) === '1');
  }, []);

  if (dismissed || !trialJustEnded(data)) return null;

  const canManage = !!data?.canManage;
  const dismiss = () => {
    window.localStorage.setItem(seenKey(), '1');
    setDismissed(true);
  };

  return (
    <NmCard className="animate-fadein flex items-start gap-3 p-4 sm:col-span-2 md:col-span-12">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-[12px] bg-background text-primary shadow-nm-inset-sm">
        <Info className="size-[18px]" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <p className="text-[13px] font-semibold leading-[1.55] text-[#5b6b82]">
          {canManage ? DIRECTOR_TEXT : STAFF_TEXT}
        </p>
        {canManage ? (
          <NmButton
            variant="soft"
            size="sm"
            className="h-[44px] w-full sm:h-[38px] sm:w-fit"
            onClick={() => router.push('/modules')}
          >
            Bo&apos;limlarni ko&apos;rish
          </NmButton>
        ) : null}
      </div>
      <NmIconButton aria-label="Yopish" className="shrink-0" onClick={dismiss}>
        <X className="size-[17px]" />
      </NmIconButton>
    </NmCard>
  );
}
