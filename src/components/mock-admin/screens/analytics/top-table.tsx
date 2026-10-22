/**
 * §3.2 TopTable: `TableWrap radius 20` + `Table`. First column = name (+ muted path) with a 4px share
 * line (row / largest row; none on "<5" rows). Numbers right-aligned, tabular. Rows are not links.
 * Desktop shows what the tab fetched (top-10 → "Hammasini ko'rish" → 50 → "Ko'proq");
 * phones show top-5 and the muted "To'liq ro'yxat — kompyuterda".
 */
import { cntNum, groupNum } from '@/lib/admin-mock/format';
import type { AnOther, Cnt } from '@/lib/admin-mock/types';
import { InlineEmpty } from '../../ui/state';
import { Table, TableWrap } from '../../ui/table';
import { mutedText, TextButton } from './blocks';
import { T } from './texts';

export interface Col<R> { key: string; label: React.ReactNode; num?: boolean; render: (r: R) => React.ReactNode; title?: (r: R) => string | undefined }

export function TopTable<R>({ rows, cols, name, bar, rowKey, mob, mobileLimit = 5, minWidth, empty, more, label, other }: {
  rows: R[];
  /** columns after the name column */
  cols: Col<R>[];
  name: { label: string; render: (r: R) => { title: React.ReactNode; sub?: React.ReactNode; hint?: string } };
  /** value that sizes the share line (null/"<5" → no line) */
  bar?: (r: R) => Cnt | null | undefined;
  rowKey: (r: R, i: number) => string;
  mob: boolean;
  mobileLimit?: number;
  minWidth?: number;
  empty: { title: string; action?: { label: string; onClick: () => void } };
  /** desktop paging: "Hammasini ko'rish" (expand) / "Ko'proq" (next cursor) */
  more?: { label: string; onClick: () => void; busy?: boolean } | null;
  label?: string;
  /**
   * v1.1 "Boshqalar ({rows} ta) · {n}" — unnamed summary of the small rows, shown at the end of a complete list
   * (contract §0.6). While it exists, shares are null and no share line is drawn.
   */
  other?: AnOther | null;
}) {
  if (!rows.length && !other) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <InlineEmpty title={empty.title} />
        {empty.action && <TextButton onClick={empty.action.onClick}>{empty.action.label}</TextButton>}
      </div>
    );
  }
  const shown = mob ? rows.slice(0, mobileLimit) : rows;
  const showOther = !!other && (!mob || rows.length <= mobileLimit);
  if (other) bar = undefined;
  const max = Math.max(1, ...shown.map((r) => cntNum(bar?.(r)) ?? 0));
  const num = { textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' } as const;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
      <TableWrap radius={20} label={label}>
        <Table minWidth={mob ? undefined : minWidth}>
          <thead>
            <tr>
              <th scope="col">{name.label}</th>
              {cols.map((c) => <th key={c.key} scope="col" style={c.num ? { textAlign: 'right' } : undefined}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => {
              const n = name.render(r);
              const b = bar ? bar(r) : null;
              const bv = cntNum(b);
              return (
                <tr key={rowKey(r, i)}>
                  <td style={{ maxWidth: mob ? 160 : 420, minWidth: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }} title={n.hint}>
                      <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</span>
                      {n.sub && <span style={{ fontSize: 12, color: 'var(--mut)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.sub}</span>}
                      {bar && b !== '<5' && (
                        <span style={{ height: 4, borderRadius: 999, background: 'var(--hover)', display: 'block' }} aria-hidden="true">
                          {bv ? <span style={{ display: 'block', height: '100%', width: `${(bv / max) * 100}%`, borderRadius: 999, background: 'var(--blue)' }} /> : null}
                        </span>
                      )}
                    </div>
                  </td>
                  {cols.map((c) => <td key={c.key} style={c.num ? num : undefined} title={c.title?.(r)}>{c.render(r)}</td>)}
                </tr>
              );
            })}
            {showOther && other && (
              <tr className="ma-an-other">
                <td colSpan={cols.length + 1} style={{ color: 'var(--ink2)', fontWeight: 600 }}>{T.other(groupNum(other.rows), other.n)}</td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableWrap>
      {mob ? rows.length > mobileLimit && <span style={mutedText}>{T.table.desktopOnly}</span>
        : more && <TextButton onClick={more.onClick}>{more.busy ? `${more.label}…` : more.label}</TextButton>}
    </div>
  );
}
