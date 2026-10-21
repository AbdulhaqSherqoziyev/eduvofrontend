'use client';
/**
 * ERP student hub — Speaking result (speaking-design.md §2 skin a): SpeakingResultPanel in an NmCard.
 * The student deletes their own recordings (contract §6, ERP text "ustozingiz ham…"); after a
 * delete the result is read again (no optimistic update). Pending → "Speaking'ni topshirish" (player).
 */
import { NmCard } from '@/components/ui/nm-card';
import { SpeakingResultPanel } from '@/components/exam/results/speaking/SpeakingResultPanel';
import { hubApi } from '@/lib/exam/hub-api';
import { t } from '@/lib/exam/i18n';
import type { SpeakingResult } from '@/lib/exam/speaking-types';
import { playerUrl } from '@/lib/exam/use-start-attempt';

export function HubSpeaking({ id, sp, onChanged }: { id: string; sp: SpeakingResult; onChanged: () => void }) {
  return (
    <NmCard className="rounded-[24px] p-6 max-md:p-4">
      <SpeakingResultPanel
        sp={sp}
        skin="hub"
        mode="erp"
        tx={(k, v) => t(k, 'uz', v)}
        takeHref={sp.status === 'pending' ? playerUrl(id) : null}
        onDelete={async () => { await hubApi.deleteRecordings(id); onChanged(); }}
      />
    </NmCard>
  );
}
