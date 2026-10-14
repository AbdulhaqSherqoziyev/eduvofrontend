'use client';
import Link from 'next/link';
import { useState } from 'react';
import { NmButton } from '@/components/ui/nm-button';
import { NmCard } from '@/components/ui/nm-card';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { StatusPill } from '@/components/shared/status-pill';
import { useMockTickets, useTicketStatus } from '@/lib/hooks/use-owner-mock';
import type { MockTicket } from '@/lib/types/owner-mock';
import { TOPIC, fmtDateTime, mockErrorText } from './format';
import { KeysetList } from './ui';

function Ticket({ t }: { t: MockTicket }) {
  const m = useTicketStatus();
  const [err, setErr] = useState('');
  const open = t.status === 'OPEN';
  return (
    <NmCard className="flex flex-col gap-2.5 p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <StatusPill label={open ? 'Ochiq' : 'Yopilgan'} tone={open ? 'warning' : 'muted'} />
        <span className="text-[13px] font-bold text-foreground">{TOPIC[t.topic] ?? t.topic}</span>
        <span className="text-[13px] text-foreground">{t.name}</span>
        <a href={`mailto:${t.email}`} className="text-[13px] font-semibold text-primary"><bdi dir="ltr">{t.email}</bdi></a>
        <span className="ml-auto text-[12px] text-muted">{fmtDateTime(t.createdAt)} · {t.locale}</span>
      </div>
      <p className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-foreground">{t.message}</p>
      <div className="flex flex-wrap items-center gap-3 text-[12.5px] text-muted">
        {t.testCode ? <span>Test: <bdi dir="ltr">{t.testCode}</bdi></span> : null}
        {t.orderId ? <Link className="font-semibold text-primary" href={`/owner/mock/orders/${t.orderId}`}>Buyurtma</Link> : null}
        {t.learnerId ? <Link className="font-semibold text-primary" href={`/owner/mock/learners/${t.learnerId}`}>O&apos;quvchi</Link> : <span>Mehmon</span>}
        <NmButton size="sm" variant="soft" className="ml-auto" disabled={m.isPending}
          onClick={() => { setErr(''); m.mutate({ id: t.id, status: open ? 'CLOSED' : 'OPEN' }, { onError: (e) => setErr(mockErrorText(e)) }); }}>
          {open ? 'Yopish' : 'Qayta ochish'}
        </NmButton>
      </div>
      {err ? <p role="alert" className="text-[12px] font-semibold text-danger">{err}</p> : null}
    </NmCard>
  );
}

/** Support tickets (U4): newest first, OPEN / CLOSED filter, close or reopen. */
export function TicketsPanel() {
  const [status, setStatus] = useState('OPEN');
  const query = useMockTickets(status);
  return (
    <div className="flex flex-col gap-4">
      <NmSegmented className="w-full sm:w-[360px]" size="sm" value={status} onValueChange={setStatus}
        items={[{ value: 'OPEN', label: 'Ochiq' }, { value: 'CLOSED', label: 'Yopilgan' }, { value: '', label: 'Hammasi' }]} />
      <KeysetList query={query} empty={status === 'OPEN' ? "Ochiq murojaat yo'q" : "Murojaat yo'q"}>
        {(items) => <div className="flex flex-col gap-3">{items.map((t) => <Ticket key={t.id} t={t} />)}</div>}
      </KeysetList>
    </div>
  );
}
