import { ProgressView } from '@/components/exams-hub/progress-view';
import { ht } from '@/lib/exam/i18n/hub';

/** /exams/progress — "Natijalarim" (_hub-design.md §5). */
export default function ExamsProgressPage() {
  return (
    <>
      <h1 className="text-[26px] font-extrabold tracking-[-0.5px] text-foreground max-md:text-[22px]">{ht('hubx.prog_title')}</h1>
      <ProgressView />
    </>
  );
}
