'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { StatusPill } from '@/components/shared/status-pill';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { CardGridSkeleton } from '@/components/shared/skeleton';
import { useMockLearner } from '@/lib/hooks/use-owner-mock';
import type { MockExamCredits } from '@/lib/types/owner-mock';
import { ATTEMPT_STATUS, EXAM, LEARNER_STATUS, ORDER_STATUS, fmtDate, fmtDateTime, fmtMoney, productLabel } from './format';
import { LearnerActions } from './learner-actions';
import { ActionsLog, LedgerTable, LotsTable } from './records';
import { KV, Muted, Section } from './ui';

const line = 'flex flex-wrap items-center gap-x-4 gap-y-0.5 rounded-[12px] bg-background px-3 py-2 text-[12.5px] shadow-nm-inset-sm';

function CreditCard({ c }: { c: MockExamCredits }) {
  const unl = c.unlimitedUntil && new Date(c.unlimitedUntil) > new Date();
  return (
    <div className="flex flex-col gap-1 rounded-[14px] bg-background p-3.5 shadow-nm-inset-sm text-[13px]">
      <span className="text-[12px] font-extrabold tracking-[0.6px] text-primary">{EXAM[c.exam] ?? c.exam}</span>
      <span className="font-bold text-foreground">{c.fullMocks} to&apos;liq · {c.sections} bo&apos;lim{unl ? ` · cheksiz ${fmtDate(c.unlimitedUntil)} gacha` : ''}</span>
      <span className="text-muted">Bepul bo&apos;lim: {c.freeSectionUsed ? 'ishlatilgan' : c.freeSectionAvailable ? 'bor' : "yo'q"}</span>
      {c.nextExpiry ? <span className="text-muted">Eng yaqin kuyish: {fmtDate(c.nextExpiry.at)}</span> : null}
      {typeof c.freshTests === 'number' ? <span className="text-muted">Yangi testlar: {c.freshTests}{c.unusableCredits ? ` · ishlatib bo'lmaydigan kredit: ${c.unusableCredits}` : ''}</span> : null}
    </div>
  );
}

export function LearnerDetail({ id }: { id: string }) {
  const query = useMockLearner(id);
  return (
    <div className="flex flex-col gap-4">
      <Link href="/owner/mock/learners" className="flex w-fit items-center gap-1.5 text-[13px] font-bold text-muted hover:text-primary"><ArrowLeft className="size-4" />O&apos;quvchilar</Link>
      <QueryBoundary query={query} loading={<CardGridSkeleton count={3} />}>
        {(d) => {
          const l = d.learner;
          const st = LEARNER_STATUS[l.status] ?? { label: l.status, tone: 'muted' as const };
          return (
            <>
              <Section title={l.email ?? l.id} action={<StatusPill label={st.label} tone={st.tone} />}>
                <KV rows={[
                  ['Ism', l.displayName ?? '—'],
                  ['Email', `${l.email ?? '—'}${l.emailVerified ? ' (tasdiqlangan)' : ' (tasdiqlanmagan)'}`],
                  ['Kirish usuli', [l.hasPassword ? 'parol' : '', l.hasGoogle ? 'Google' : ''].filter(Boolean).join(', ') || '—'],
                  ['Til · mamlakat', `${l.locale} · ${l.country ?? '—'} · ${l.timezone ?? '—'}`],
                  ['Maqsad', l.goal ? `${EXAM[l.goal.exam] ?? l.goal.exam} ${l.goal.target ?? ''}${l.goal.examDate ? ` · ${fmtDate(l.goal.examDate)}` : ''}` : '—'],
                  ["Ro'yxatdan o'tgan", fmtDateTime(l.createdAt)],
                  ['Oxirgi kirish', fmtDateTime(l.lastLoginAt)],
                  ['Faol sessiyalar', String(d.liveSessions)],
                  ["O'chirish rejasi", l.deletionScheduledAt ? fmtDateTime(l.deletionScheduledAt) : '—'],
                  ['Marketing xatlari', l.marketingOptIn ? 'Roziligi bor' : "Yo'q"],
                ]} />
                <LearnerActions learner={l} />
              </Section>
              <Section title="Kreditlar">
                {d.credits.length ? <div className="grid gap-3 sm:grid-cols-2">{d.credits.map((c) => <CreditCard key={c.exam} c={c} />)}</div> : <Muted>Kredit yo&apos;q.</Muted>}
              </Section>
              <Section title="Kredit partiyalari"><LotsTable lots={d.lots} /></Section>
              <Section title="Kredit harakatlari"><LedgerTable ledger={d.ledger} /></Section>
              <Section title="Urinishlar">
                {d.attempts.length ? (
                  <div className="flex flex-col gap-1.5">
                    {d.attempts.map((a) => (
                      <div key={a.attemptId} className={line}>
                        <span className="font-bold text-foreground">{EXAM[a.exam] ?? a.exam} · {a.mode === 'full' ? "To'liq" : a.sectionKey ?? "Bo'lim"}</span>
                        <span className="text-muted"><bdi dir="ltr">{a.testCode}</bdi>{a.isFree ? ' · bepul' : ''}</span>
                        <span className="text-foreground">{ATTEMPT_STATUS[a.status] ?? a.status}{a.notGraded ? ' · Writing baholanmadi' : ''}{a.refunded ? ' · kredit qaytarildi' : ''}</span>
                        <span className="font-bold text-foreground">{a.score?.label ?? (a.score?.value != null ? String(a.score.value) : '')}</span>
                        {a.correct != null && a.total ? (
                          <span className="text-muted">
                            {a.total} tadan {a.correct} ta to&apos;g&apos;ri{a.correctBySection && a.correctBySection.length > 1 ? ` (${a.correctBySection.map((x) => `${x.key}: ${x.correct}/${x.total}`).join(', ')})` : ''}
                          </span>
                        ) : null}
                        <span className="ml-auto text-muted">{fmtDateTime(a.finishedAt ?? a.startedAt)}</span>
                      </div>
                    ))}
                  </div>
                ) : <Muted>Urinishlar yo&apos;q.</Muted>}
              </Section>
              <Section title="Buyurtmalar">
                {d.orders.length ? (
                  <div className="flex flex-col gap-1.5">
                    {d.orders.map((o) => {
                      const os = ORDER_STATUS[o.status] ?? { label: o.status, tone: 'muted' as const };
                      return (
                        <Link key={o.id} href={`/owner/mock/orders/${o.id}`} className={`${line} hover:text-primary`}>
                          <span className="font-bold text-foreground"><bdi dir="ltr">{o.reference}</bdi></span>
                          <span className="text-muted">{productLabel(o.quote.product)}</span>
                          <span className="font-bold text-foreground"><bdi dir="ltr">{fmtMoney(o.quote.total)}</bdi></span>
                          <StatusPill label={os.label} tone={os.tone} />
                          <span className="ml-auto text-muted">{fmtDateTime(o.createdAt)}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : <Muted>Buyurtmalar yo&apos;q.</Muted>}
              </Section>
              <Section title="Owner amallari"><ActionsLog actions={d.actions} /></Section>
            </>
          );
        }}
      </QueryBoundary>
    </div>
  );
}
