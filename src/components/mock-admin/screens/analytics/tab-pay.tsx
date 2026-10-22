'use client';
/**
 * §11 "To'lov": anonymous site steps (tracker), then manual transfer and Paddle funnels side by side
 * (database; never summed, no "Jami"), each with its own neutral "Eng ko'p qaytish", and Paddle errors.
 */
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-mock/api';
import { cnt, dayMonth, groupNum } from '@/lib/admin-mock/format';
import type { AnPaymentsRes, Cnt } from '@/lib/admin-mock/types';
import { ErrorState, InlineEmpty } from '../../ui/state';
import { Skeleton } from '../../ui/table';
import { Card, Dim, eyebrow, mutedText, Note, NotTracked, QueryError } from './blocks';
import { AnalyticsFooter } from './footer';
import { periodStartMs, type Period } from './period';
import { Steps } from './steps';
import { StopCard } from './stop-card';
import { T } from './texts';
import { TopTable } from './top-table';

/** short step names of the "ENG KO'P QAYTISH" lines (§11.1 drawing) */
const SHORT = { created: 'Yaratildi', claimed: "\"To'ladim\"", opened: 'Oyna ochildi', paid: "To'landi" };

export function TabPay({ period, mob }: { period: Period; mob: boolean }) {
  const q = useQuery({
    queryKey: ['am', 'an', 'payments', period.query],
    queryFn: () => adminApi.anPayments(period.query!),
    enabled: !!period.query,
    placeholderData: (p) => p,
  });
  if (q.isError && !q.data) return <QueryError q={q} />;
  if (!q.data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} aria-busy="true">
        <Skeleton height={220} />
        <div className="ma-an-g2"><Skeleton height={420} /><Skeleton height={420} /></div>
      </div>
    );
  }
  const d = q.data;
  const start = periodStartMs(period);
  const retry = { onRetry: () => void q.refetch(), busy: q.isFetching };
  return (
    <Dim on={q.isFetching && q.isPlaceholderData}>
      <Card title={T.pay.siteSteps} right={<span style={mutedText}>{T.funnel.byVisits}</span>}>
        {d.trackingSince === null ? <NotTracked /> : (
          <>
            <Steps steps={[
              { key: 'pricing', label: T.pay.pricing, value: d.site.pricing },
              { key: 'checkout', label: T.pay.checkout, value: d.site.checkout },
              { key: 'quote', label: T.pay.quote, value: d.site.quote, dashTitle: d.site.quoteSince ? T.pay.since(dayMonth(d.site.quoteSince)) : undefined },
            ]} />
            <Note>{T.pay.siteNote}</Note>
          </>
        )}
      </Card>
      <div className="ma-an-g2">
        <Manual d={d} retry={retry} />
        <Paddle d={d} start={start} retry={retry} />
      </div>
      {d.paddleErrors.length > 0 && (
        <Card title={T.pay.errorsTitle}>
          <TopTable mob={mob} rows={d.paddleErrors} rowKey={(r) => r.code} empty={{ title: '' }}
            name={{ label: T.col.reason, render: (r) => ({ title: r.label || T.pay.otherError }) }}
            cols={[{ key: 'n', label: T.col.count, num: true, render: (r) => groupNum(r.n) }]} />
        </Card>
      )}
      <AnalyticsFooter kind="db" />
    </Dim>
  );
}

function Rest({ rows }: { rows: Array<{ label: string; n: Cnt | null; title?: string }> }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
      <span style={{ ...eyebrow, textTransform: 'none', letterSpacing: 0, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{T.pay.rest}:</span>
      {rows.map((r) => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', fontSize: 13 }}>
          <span style={{ fontWeight: 600, color: 'var(--ink2)' }}>{r.label}</span>
          <b style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }} title={r.title}>{r.n === null ? '—' : cnt(r.n)}</b>
        </div>
      ))}
    </div>
  );
}

function DbErr({ onRetry, busy }: { onRetry: () => void; busy: boolean }) {
  return <ErrorState flat title={T.state.loadErr} text={T.state.loadErrText} onRetry={onRetry} retrying={busy} />;
}

function Manual({ d, retry }: { d: AnPaymentsRes; retry: { onRetry: () => void; busy: boolean } }) {
  const m = d.manual;
  return (
    <Card title={T.pay.manual}>
      {!m ? <DbErr {...retry} /> : m.created === 0 ? <InlineEmpty title={T.pay.noOrders(T.pay.providerManual)} /> : (
        <>
          <Steps steps={[
            { key: 'created', label: T.pay.created, value: m.created },
            { key: 'claimed', label: T.pay.claimed, value: m.claimed },
            { key: 'paid', label: T.pay.paid, value: m.paid },
          ]} />
          <Rest rows={[
            { label: T.pay.pending, n: m.pending },
            { label: T.pay.expired, n: m.expiredOrCancelled },
            { label: T.pay.rejected, n: m.failed },
            { label: T.pay.refunded, n: m.refunded },
          ]} />
          <StopCard title={T.pay.stopTitle} unit="orders" transitions={[
            { from: SHORT.created, to: SHORT.claimed, num: m.claimed, den: m.created },
            { from: SHORT.claimed, to: SHORT.paid, num: m.paid, den: m.claimed },
          ]} />
        </>
      )}
      <span style={mutedText}>{T.pay.manualNote}</span>
    </Card>
  );
}

function Paddle({ d, start, retry }: { d: AnPaymentsRes; start: number; retry: { onRetry: () => void; busy: boolean } }) {
  const p = d.paddle;
  if (!p) return <Card title={T.pay.paddle}><DbErr {...retry} /><span style={mutedText}>{T.pay.paddleNote}</span></Card>;
  const sinceTitle = p.eventsSince ? T.pay.since(dayMonth(p.eventsSince)) : undefined;
  return (
    <Card title={T.pay.paddle}>
      {!p.enabled ? <InlineEmpty title={T.pay.paddleOff} text={T.pay.paddleOffText} /> : p.created === 0 ? <InlineEmpty title={T.pay.noOrders(T.pay.providerPaddle)} /> : (
        <>
          {p.eventsSince && Date.parse(p.eventsSince) > start && <span style={mutedText}>{T.pay.paddleSince(dayMonth(p.eventsSince))}</span>}
          <Steps steps={[
            { key: 'created', label: T.pay.created, value: p.created },
            { key: 'opened', label: T.pay.opened, value: p.opened, dashTitle: sinceTitle },
            { key: 'paid', label: T.pay.paid, value: p.paid },
          ]} />
          <Rest rows={[
            { label: T.pay.closedUnpaid, n: p.closedUnpaid, title: p.closedUnpaid === null ? sinceTitle : undefined },
            { label: T.pay.error, n: p.error },
            { label: T.pay.pending, n: p.pending },
            { label: T.pay.refunded, n: p.refunded },
          ]} />
          <StopCard title={T.pay.stopTitle} unit="orders" transitions={[
            { from: SHORT.created, to: SHORT.opened, num: p.opened, den: p.created },
            { from: SHORT.opened, to: SHORT.paid, num: p.paid, den: p.opened },
          ]} />
        </>
      )}
      <span style={mutedText}>{T.pay.paddleNote}</span>
    </Card>
  );
}
