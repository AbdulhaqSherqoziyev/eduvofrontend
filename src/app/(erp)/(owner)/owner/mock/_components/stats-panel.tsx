'use client';
import { useState } from 'react';
import { BellRing, CreditCard, UserPlus, Wallet } from 'lucide-react';
import { NmInput } from '@/components/ui/nm-input';
import { FieldLabel } from '@/components/ui/label';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { CardGridSkeleton } from '@/components/shared/skeleton';
import { StatCard } from '@/components/shared/stat-card';
import { useMockAlerts, useMockStats } from '@/lib/hooks/use-owner-mock';
import { EXAM, fmtDate, fmtDateTime, fmtMoneyList } from './format';
import { actionLabel } from './records';
import { TashkentTimeNote } from '@/components/owner/tashkent-time-note';
import { KV, KeysetList, Muted, Section } from './ui';

const iso = (d: Date) => d.toISOString().slice(0, 10);
const REFUND: Record<string, string> = { cancelled: 'Natijasiz yopilgan', grading_failed: 'Writing baholanmadi', other: 'Boshqa' };

/** Totals, daily table, attempts per exam, bank, mail health, and the owner alert feed. */
export function StatsPanel() {
  const [to, setTo] = useState(() => iso(new Date()));
  const [from, setFrom] = useState(() => iso(new Date(Date.now() - 29 * 86_400_000)));
  const valid = !!from && !!to && from <= to;
  const query = useMockStats(valid ? from : '', valid ? to : '');
  const alerts = useMockAlerts();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-[170px]"><FieldLabel htmlFor="st-from">Dan</FieldLabel><NmInput id="st-from" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="w-[170px]"><FieldLabel htmlFor="st-to">Gacha</FieldLabel><NmInput id="st-to" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></div>
        {!valid ? <span className="pb-3 text-[12px] font-semibold text-danger">Sanalar oralig&apos;i noto&apos;g&apos;ri</span> : null}
        {/* backend days are Asia/Tashkent (spec analytics §1.3.1) */}
        <TashkentTimeNote className="pb-3" />
      </div>
      <QueryBoundary query={query} loading={<CardGridSkeleton count={4} />}>
        {(s) => (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Ro'yxatdan o'tganlar" value={String(s.totals.signups)} icon={<UserPlus className="size-5" />} footer={<span>Tasdiqlangan: {s.totals.verified}</span>} />
              <StatCard label="Buyurtmalar" value={String(s.totals.ordersCreated)} icon={<CreditCard className="size-5" />} footer={<span>To&apos;langan: {s.totals.paidOrders}</span>} />
              <StatCard label="Tushum" value={fmtMoneyList(s.totals.revenue)} icon={<Wallet className="size-5" />} accent footer={<span>AI xarajati: ${s.totals.aiSpendUsd.toFixed(2)}</span>} />
              <StatCard label="Ogohlantirishlar (24 soat)" value={String(s.alerts24h)} icon={<BellRing className="size-5" />} />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Section title="Urinishlar">
                <KV rows={Object.entries(s.totals.attemptsByExam).map(([e, c]) => [EXAM[e] ?? e, c ? `To'liq ${c.full} · bo'lim ${c.section} · yakunlangan ${c.completed} · bekor ${c.cancelled} · muddati o'tgan ${c.expired}` : '—'] as [string, string])
                  .concat(Object.keys(s.totals.attemptsByExam).length ? [] : [['Urinishlar', "Bu oraliqda yo'q"]])
                  .concat([["Kredit qaytarilgan", Object.entries(s.totals.attemptRefunds).map(([k, n]) => `${REFUND[k] ?? k}: ${n}`).join(' · ') || '0']])} />
              </Section>
              <Section title="Test banki va pochta">
                <KV rows={[
                  ...Object.entries(s.bank.publishedTests).map(([e, n]) => [`${EXAM[e] ?? e} testlari`, String(n ?? 0)] as [string, string]),
                  ['Pochta', s.mail ? `${s.mail.provider ?? '—'} · ${s.mail.lastSendOk === false ? "oxirgi xat ketmadi" : s.mail.lastSendOk ? 'ishlayapti' : "hali xat yo'q"}` : '—'],
                  ['Navbatda / 24 soatda xato', s.mail ? `${s.mail.queued ?? 0} / ${s.mail.failed24h ?? 0}` : '—'],
                  ['Oxirgi xato', fmtDateTime(s.mail?.lastErrorAt ?? null)],
                ]} />
              </Section>
            </div>
            <Section title={`Kunlar bo'yicha (${fmtDate(s.from)} — ${fmtDate(s.to)})`}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-[12.5px]">
                  <thead><tr className="text-left text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]">
                    <th className="py-2 pr-3">Sana</th><th className="pr-3">Ro&apos;yxat</th><th className="pr-3">Tasdiq</th><th className="pr-3">Buyurtma</th><th className="pr-3">To&apos;langan</th><th>Tushum</th>
                  </tr></thead>
                  <tbody>
                    {[...s.daily].reverse().map((d) => (
                      <tr key={d.date} className="border-t border-[rgba(122,134,153,0.14)] text-foreground">
                        <td className="py-1.5 pr-3 text-muted">{fmtDate(d.date)}</td><td className="pr-3">{d.signups}</td><td className="pr-3">{d.verified}</td>
                        <td className="pr-3">{d.ordersCreated}</td><td className="pr-3">{d.ordersPaid}</td><td><bdi dir="ltr">{d.revenue.length ? fmtMoneyList(d.revenue) : '—'}</bdi></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </>
        )}
      </QueryBoundary>
      <Section title="Ogohlantirishlar">
        <KeysetList query={alerts} empty="Ogohlantirish yo'q">
          {(items) => (
            <div className="flex flex-col gap-1.5">
              {items.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-0.5 rounded-[12px] bg-background px-3 py-2 text-[12.5px] shadow-nm-inset-sm">
                  <span className="font-bold text-foreground">{actionLabel(a.action)}</span>
                  <span className="min-w-0 break-words text-muted">{a.meta ? Object.entries(a.meta).filter(([, v]) => v !== null && typeof v !== 'object').map(([k, v]) => `${k}: ${String(v)}`).join(' · ') : ''}</span>
                  <span className="ml-auto text-muted">{fmtDateTime(a.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </KeysetList>
        <Muted>Avtomatik ogohlantirishlar: qo&apos;lda to&apos;lov kutilmoqda, summa mos emas, refund va boshqalar.</Muted>
      </Section>
    </div>
  );
}
