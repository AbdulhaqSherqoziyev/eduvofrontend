'use client';

import { useState } from 'react';
import { WifiOff } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorCard } from '@/components/shared/error-card';
import { RowsSkeleton, Skeleton } from '@/components/shared/skeleton';
import { PayrollStatusPill } from '@/components/payroll/payroll-status-pill';
import { can } from '@/lib/auth/permissions';
import { useMyPayroll } from '@/lib/hooks/use-payroll';
import { useOnline } from '@/lib/hooks/use-online';
import { currentPeriod, monthName } from '@/lib/utils/payroll-labels';
import { BreakdownCard, type LinesRequest } from './breakdown-card';
import { GroupList } from './group-list';
import { LinesDialog } from './lines-dialog';
import { PendingCard } from './pending-card';
import { PeriodSwitch } from '@/components/payroll/period-switch';
import { ResultCard } from './result-card';

const status = (error: unknown): number | undefined =>
  (error as { response?: { status?: number } })?.response?.status;

/**
 * `/my-salary` — ustozning O'Z ekrani [E1, S1].
 *
 * USTOZ TANLASH FILTRI, QIDIRUVI, RO'YXATI — UMUMAN YO'Q. Backend `teacherId`
 * ni qabul qilmaydi, ya'ni boshqa odamnikini so'raydigan yo'l MAVJUD EMAS —
 * bu 403 dan kuchliroq kafolat (§C.1).
 *
 * Ekranda ATAYLAB YO'Q [S1, S5.1]: markaz tushumi · xarajat · sof foyda ·
 * boshqa ustozlar · reyting/o'rin · `markazga qoladi` · qarzdorlar ismi.
 */
export function MySalaryView() {
  const [period, setPeriod] = useState(currentPeriod());
  const [lines, setLines] = useState<LinesRequest | null>(null);
  const [groupId, setGroupId] = useState('');
  const online = useOnline();
  const query = useMyPayroll(period);
  const me = query.data;

  if (!can('payroll.self')) return null;

  const openLines = (request: LinesRequest) => {
    setGroupId('');
    setLines(request);
  };

  return (
    <section className="flex flex-col gap-5">
      {!online ? (
        <div className="sticky top-0 z-20 flex items-center gap-2 rounded-ctl bg-background px-4 py-2.5 text-[12px] font-semibold text-foreground shadow-nm-inset-sm">
          <WifiOff className="size-3.5 text-muted" />
          Internet yo&apos;q — ma&apos;lumot yangilanmadi.
        </div>
      ) : null}

      <PeriodSwitch period={period} onChange={setPeriod}>
        {me ? <PayrollStatusPill status={me.status} /> : null}
      </PeriodSwitch>

      {query.isLoading ? (
        <div className="flex flex-col gap-5">
          <Skeleton className="h-[120px] w-full" />
          <RowsSkeleton rows={5} />
          <RowsSkeleton rows={3} />
        </div>
      ) : query.isError ? (
        status(query.error) === 403 ? (
          /* `User.teacherId` bog'lanmagan hisob (§C.8). Telefon bo'yicha topish
             ATAYLAB yo'q: oiladagi bir xil raqam boshqa odamning maoshini
             ochib qo'yardi [SV8]. */
          <EmptyState
            title="Ish haqi ma'lumoti topilmadi"
            hint="Hisobingiz o'qituvchi kartasiga bog'lanmagan. Administratorga murojaat qiling."
          />
        ) : (
          <ErrorCard onRetry={() => query.refetch()} />
        )
      ) : !me ? null : me.notCovered ? (
        /* Hint MAJBURIY [F4]: usiz ustoz yo'q ma'lumotni qidiraveradi. */
        <EmptyState
          title="Bu oy uchun hisob yuritilmagan"
          hint="Tizimda ish haqi hisobi bu oydan keyinroq boshlangan."
        />
      ) : (
        <>
          <ResultCard me={me} />
          <BreakdownCard me={me} onOpenLines={openLines} />
          <PendingCard me={me} />
          <GroupList
            me={me}
            onOpenGroup={(id, name) => {
              setGroupId(id);
              setLines({
                period,
                title: `Tushgan to'lovlar · ${name} · ${monthName(period)}`,
                showShare: false,
              });
            }}
          />
        </>
      )}

      {lines ? (
        <LinesDialog
          open
          onOpenChange={(next) => !next && setLines(null)}
          title={lines.title}
          period={lines.period}
          showShare={lines.showShare}
          groupId={groupId || undefined}
          groups={me?.groups ?? []}
          onGroupChange={setGroupId}
        />
      ) : null}
    </section>
  );
}
