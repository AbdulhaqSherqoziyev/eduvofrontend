'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { StatusPill } from '@/components/shared/status-pill';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { CardGridSkeleton } from '@/components/shared/skeleton';
import { useMockOrder } from '@/lib/hooks/use-owner-mock';
import { FAILURE, KIND, EXAM, ORDER_STATUS, PROVIDER, fmtDateTime, fmtMoney, productLabel } from './format';
import { OrderActions } from './order-actions';
import { ActionsLog, LotsTable } from './records';
import { KV, Muted, Section } from './ui';

export function OrderDetail({ id }: { id: string }) {
  const query = useMockOrder(id);
  return (
    <div className="flex flex-col gap-4">
      <Link href="/owner/mock" className="flex w-fit items-center gap-1.5 text-[13px] font-bold text-muted hover:text-primary"><ArrowLeft className="size-4" />Buyurtmalar</Link>
      <QueryBoundary query={query} loading={<CardGridSkeleton count={3} />}>
        {({ order: o, learner, events, actions, lots }) => {
          const st = ORDER_STATUS[o.status] ?? { label: o.status, tone: 'muted' as const };
          const g = o.granted;
          return (
            <>
              <Section title={`Buyurtma ${o.reference}`} action={<StatusPill label={st.label} tone={st.tone} />}>
                <KV rows={[
                  ['Mahsulot', productLabel(o.quote.product)],
                  ['Summa', <bdi key="t" dir="ltr">{fmtMoney(o.quote.total)}</bdi>],
                  ['Chegirma', o.quote.promo ? `${o.quote.promo.code} · ${o.quote.promo.percentOff}% (−${fmtMoney(o.quote.discount)})` : '—'],
                  ["To'lov usuli", `${PROVIDER[o.provider] ?? o.provider} · ${o.methodGroup}`],
                  ['Kvitansiya', o.receiptNo ?? '—'],
                  ['Provayder ID', o.providerRef ? <bdi key="p" dir="ltr">{o.providerRef}</bdi> : '—'],
                  ['Yaratilgan', fmtDateTime(o.createdAt)],
                  ["To'langan", fmtDateTime(o.paidAt)],
                  ['Muddat', fmtDateTime(o.expiresAt)],
                  ['Xato sababi', o.failureCode ? FAILURE[o.failureCode] ?? o.failureCode : '—'],
                  ['Berilgan kreditlar', g ? [g.fullMocks ? `${g.fullMocks} ${KIND.full}` : '', g.sections ? `${g.sections} ${KIND.section}` : '', g.unlimitedDays ? `${g.unlimitedDays} kun cheksiz` : ''].filter(Boolean).join(', ') || '—' : '—'],
                  ['Izoh', o.note ?? '—'],
                ]} />
                <OrderActions order={o} />
              </Section>
              <Section title="O'quvchi">
                {learner ? (
                  <KV rows={[
                    ['Email', <Link key="e" href={`/owner/mock/learners/${learner.id}`} className="text-primary hover:underline">{learner.email ?? '—'}</Link>],
                    ['Ism', learner.displayName ?? '—'],
                    ['Mamlakat', learner.country ?? '—'],
                    ['Maqsad', learner.goal ? `${EXAM[learner.goal.exam] ?? learner.goal.exam} ${learner.goal.target ?? ''}` : '—'],
                  ]} />
                ) : <Muted>O&apos;quvchi topilmadi (anonimlashtirilgan bo&apos;lishi mumkin).</Muted>}
              </Section>
              <Section title="Webhook jurnali">
                {events.length ? (
                  <div className="flex flex-col gap-1.5">
                    {events.map((e) => (
                      <div key={e.id} className="flex flex-wrap gap-x-4 gap-y-0.5 rounded-[12px] bg-background px-3 py-2 text-[12.5px] shadow-nm-inset-sm">
                        <span className="font-bold text-foreground">{e.eventType}</span>
                        <span className="text-muted">{e.provider} · <bdi dir="ltr">{e.eventId}</bdi></span>
                        <span className="text-muted">{e.outcome ?? '—'}</span>
                        <span className="ml-auto text-muted">{fmtDateTime(e.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                ) : <Muted>Webhook hodisalari yo&apos;q.</Muted>}
              </Section>
              <Section title="Kredit partiyalari"><LotsTable lots={lots} /></Section>
              <Section title="Owner amallari"><ActionsLog actions={actions} /></Section>
            </>
          );
        }}
      </QueryBoundary>
    </div>
  );
}
