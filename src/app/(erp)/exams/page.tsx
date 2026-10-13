import { Suspense } from 'react';
import { HubView } from '@/components/exams-hub/hub-view';
import { ht } from '@/lib/exam/i18n/hub';

/** /exams — student hub (_hub-design.md §2). The title renders at once; data below it. */
export default function ExamsHubPage() {
  return (
    <>
      <div>
        <h1 className="text-[26px] font-extrabold tracking-[-0.5px] text-foreground max-md:text-[22px]">{ht('hubx.title')}</h1>
        <p className="mt-1.5 text-[14px] font-medium leading-[1.6] text-[#5b6b82]">{ht('hubx.lead')}</p>
      </div>
      <Suspense>
        <HubView />
      </Suspense>
    </>
  );
}
