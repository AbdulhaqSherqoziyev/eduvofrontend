'use client';
/**
 * ERP hub — Speaking left for a separate sitting (speaking contract v1.4 `exams[].speakingLater`): one card per
 * exam, the days left until `availableUntil` (L/R/W finish + 7 days) and "Speaking'ni boshlash" (the player
 * resumes the attempt on the Speaking intro). Copy as the mock.eduvo.uz dashboard card (speaking-design §7.2).
 */
import { Mic } from 'lucide-react';
import Link from 'next/link';
import { NmCard } from '@/components/ui/nm-card';
import type { HubExam } from '@/lib/exam/hub-types';
import { playerUrl } from '@/lib/exam/use-start-attempt';

export function SpeakingLaterCards({ exams, now }: { exams: HubExam[]; now: number }) {
  const list = exams.filter((e) => e.speakingLater && Date.parse(e.speakingLater.availableUntil) > now);
  if (!list.length) return null;
  return (
    <>
      {list.map((e) => {
        const sl = e.speakingLater!;
        const days = Math.max(1, Math.ceil((Date.parse(sl.availableUntil) - now) / 864e5));
        return (
          <NmCard key={sl.attemptId} className="flex flex-wrap items-center gap-4 rounded-[24px] p-5 max-md:p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-[#EEF4FF] text-primary"><Mic className="size-5" aria-hidden /></span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-extrabold text-foreground">{e.family} · Speaking kutmoqda</div>
              <div className="mt-0.5 text-[13px] font-semibold text-muted">{days} kun qoldi · 14 daqiqa · kompyuterda</div>
            </div>
            <Link href={playerUrl(sl.attemptId)} className="flex h-[44px] items-center justify-center rounded-ctl bg-grad-primary px-5 text-[14px] font-bold text-white shadow-nm-primary max-md:w-full">
              Speaking&apos;ni boshlash
            </Link>
          </NmCard>
        );
      })}
    </>
  );
}
