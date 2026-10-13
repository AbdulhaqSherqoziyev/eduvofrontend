'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, ChevronLeft, ClipboardList, CreditCard, Plus, Users, Wallet } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import { can } from '@/lib/auth/permissions';
import { ADD_TO_GROUP } from '@/lib/utils/group-move';
import { Avatar } from '@/components/ui/avatar';
import { StatusPill } from '@/components/shared/status-pill';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { useStudentProfile } from '@/lib/hooks/use-students';
import { formatSom } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { INVOICE_STATUS_META, type InvoiceStatus } from '@/lib/types/payment';
import { STUDENT_STATUS_META, type StudentProfileGroup } from '@/lib/types/student';
import { NO_GROUPS } from '@/lib/utils/price-labels';
import { EnrollmentPriceDialog } from './enrollment-price-dialog';
import { ProfileGroupCard } from './profile-group-card';
import { GroupChangeDialog } from './group-change-dialog';

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'warning' | 'danger' | 'muted' }) {
  const color =
    tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : tone === 'danger' ? 'text-danger' : 'text-foreground';
  return (
    <div className="rounded-[14px] bg-background px-4 py-3 shadow-nm-inset-sm">
      <div className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]">{label}</div>
      <div className={cn('mt-0.5 text-[17px] font-extrabold', color)}>{value}</div>
    </div>
  );
}

function SectionTitle({ icon: Icon, children, className }: { icon: typeof Users; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-3 flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.6px] text-muted', className)}>
      <Icon className="size-4 text-primary" strokeWidth={2.2} /> {children}
    </div>
  );
}

/** Full student profile: header, groups, attendance, finance, assignments. */
export function StudentProfileView({ id }: { id: string }) {
  const query = useStudentProfile(id);
  const [priceGroup, setPriceGroup] = useState<StudentProfileGroup | null>(null);
  // null = closed; { from: undefined } = add one more group; { from } = move out of it.
  const [groupChange, setGroupChange] = useState<{ from?: StudentProfileGroup } | null>(null);
  const canChangeGroups = can('student.update');

  return (
    <section className="flex flex-col gap-5">
      <Link href="/students" className="flex w-fit items-center gap-1.5 text-[13px] font-bold text-muted hover:text-primary">
        <ChevronLeft className="size-[15px]" strokeWidth={2.4} /> O&apos;quvchilar ro&apos;yxati
      </Link>

      <QueryBoundary query={query} loading={<RowsSkeleton rows={6} />} isEmpty={() => false} empty={null}>
        {(p) => {
          const meta = STUDENT_STATUS_META[p.status];
          return (
            <>
              <NmCard className="p-[22px]">
                <div className="flex flex-wrap items-center gap-4">
                  <Avatar name={p.fullName} size={64} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-[20px] font-extrabold tracking-[-0.3px] text-foreground">{p.fullName}</h1>
                      <StatusPill label={meta.label} tone={meta.tone} />
                    </div>
                    <p className="mt-1 text-[13px] font-semibold text-muted">
                      {p.phone} · Qo&apos;shilgan: {formatDate(p.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#9aa6b8]">Balans</div>
                    <div className={cn('text-[22px] font-extrabold', p.balance < 0 ? 'text-danger' : p.balance > 0 ? 'text-success' : 'text-muted')}>
                      {formatSom(p.balance, { sign: true })}
                    </div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="Davomat" value={p.attendance.rate != null ? `${p.attendance.rate}%` : '—'}
                    tone={p.attendance.rate == null ? 'muted' : p.attendance.rate >= 85 ? 'success' : p.attendance.rate >= 60 ? 'warning' : 'danger'} />
                  <Stat label="Guruhlar" value={String(p.groups.length)} />
                  <Stat label="Vazifalar (baholangan)" value={`${p.assignments.graded}/${p.assignments.total}`} />
                  <Stat label="O'rtacha ball" value={p.assignments.avgScore != null ? String(p.assignments.avgScore) : '—'} />
                </div>
              </NmCard>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <NmCard className="p-[20px]">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <SectionTitle icon={Users} className="mb-0">Guruhlari</SectionTitle>
                    {canChangeGroups ? (
                      <NmButton type="button" variant="soft" size="sm" onClick={() => setGroupChange({})}>
                        <Plus className="size-[15px]" strokeWidth={2.4} /> {ADD_TO_GROUP}
                      </NmButton>
                    ) : null}
                  </div>
                  {p.groups.length === 0 ? (
                    <p className="text-[13px] font-semibold text-muted">{NO_GROUPS}</p>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {p.groups.map((g) => (
                        <ProfileGroupCard
                          key={g.id}
                          group={g}
                          onEditPrice={() => setPriceGroup(g)}
                          onMove={() => setGroupChange({ from: g })}
                        />
                      ))}
                    </div>
                  )}
                </NmCard>

                <NmCard className="p-[20px]">
                  <SectionTitle icon={CalendarCheck}>Davomat statistikasi</SectionTitle>
                  <div className="grid grid-cols-2 gap-3">
                    <Stat label="Keldi" value={String(p.attendance.present)} tone="success" />
                    <Stat label="Kechikdi" value={String(p.attendance.late)} tone="warning" />
                    <Stat label="Kelmadi" value={String(p.attendance.absent)} tone="danger" />
                    <Stat label="Sababli" value={String(p.attendance.excused)} tone="muted" />
                  </div>
                  <p className="mt-3 text-[12px] font-semibold text-muted">
                    Jami belgilangan darslar: {p.attendance.total}
                  </p>
                </NmCard>

                <NmCard className="p-[20px]">
                  <SectionTitle icon={Wallet}>Oylik to&apos;lovlar</SectionTitle>
                  {p.invoices.length === 0 ? (
                    <p className="text-[13px] font-semibold text-muted">Hisob-faktura yo&apos;q.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {p.invoices.map((inv) => {
                        const im = INVOICE_STATUS_META[inv.status as InvoiceStatus];
                        return (
                          <div key={inv.id} className="flex items-center justify-between rounded-[13px] bg-background px-4 py-2.5 shadow-nm-inset-sm">
                            <span className="text-[13px] font-bold text-foreground">{inv.period}</span>
                            <span className="text-[13px] font-semibold text-muted">
                              {formatSom(inv.paidAmount)} / {formatSom(inv.amount)}
                            </span>
                            {im ? <StatusPill label={im.label} tone={im.tone} /> : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </NmCard>

                <NmCard className="p-[20px]">
                  <SectionTitle icon={CreditCard}>So&apos;nggi to&apos;lovlar</SectionTitle>
                  {p.transactions.length === 0 ? (
                    <p className="text-[13px] font-semibold text-muted">To&apos;lovlar yo&apos;q.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {p.transactions.map((t) => (
                        <div key={t.id} className="flex items-center justify-between rounded-[13px] bg-background px-4 py-2.5 shadow-nm-inset-sm">
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-foreground">{formatDate(t.date)}</div>
                            <div className="truncate text-[12px] font-semibold text-muted">{t.note || t.method}</div>
                          </div>
                          <span className={cn('text-[13.5px] font-extrabold', t.type === 'INCOME' ? 'text-success' : 'text-danger')}>
                            {(t.type === 'INCOME' ? '+ ' : '− ') + formatSom(t.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </NmCard>
              </div>

              <NmCard className="p-[20px]">
                <SectionTitle icon={ClipboardList}>Vazifalar</SectionTitle>
                <p className="text-[13px] font-semibold text-muted">
                  Topshirilgan: {p.assignments.total} · Baholangan: {p.assignments.graded} · O&apos;rtacha ball:{' '}
                  {p.assignments.avgScore != null ? p.assignments.avgScore : '—'}
                </p>
              </NmCard>

              {priceGroup ? (
                <EnrollmentPriceDialog
                  key={priceGroup.enrollmentId}
                  open
                  onOpenChange={(o) => { if (!o) setPriceGroup(null); }}
                  studentName={p.fullName}
                  // Live row, so a refetch after saving reaches the open dialog.
                  group={p.groups.find((g) => g.enrollmentId === priceGroup.enrollmentId) ?? priceGroup}
                />
              ) : null}

              {groupChange ? (
                <GroupChangeDialog
                  key={groupChange.from?.enrollmentId ?? 'add'}
                  open
                  onOpenChange={(o) => { if (!o) setGroupChange(null); }}
                  studentId={p.id}
                  memberGroupIds={p.groups.map((g) => g.id)}
                  from={groupChange.from}
                />
              ) : null}
            </>
          );
        }}
      </QueryBoundary>
    </section>
  );
}
