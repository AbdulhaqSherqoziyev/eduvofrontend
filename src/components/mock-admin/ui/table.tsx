/**
 * Table (Admin Components.dc.html · JADVAL QATORLARI): paper surface, hairline rows, hover; row states
 * `selected` (inset), `confirmed` (okBg), `disabled` (55% opacity); shimmer skeleton rows while loading.
 */
export type RowState = 'selected' | 'confirmed' | 'disabled';

export function TableWrap({ children, radius = 20, label }: { children: React.ReactNode; radius?: 16 | 20; label?: string }) {
  return (
    <div className={`ma-table-wrap${radius === 16 ? ' r-16' : ''}`} role={label ? 'region' : undefined} aria-label={label} tabIndex={label ? 0 : undefined}>
      {children}
    </div>
  );
}

/** `<table>` with the admin styles; pass `minWidth` so wide tables scroll inside the wrap (Orders: 1100). */
export function Table({ minWidth, children }: { minWidth?: number; children: React.ReactNode }) {
  return <table className="ma-table" style={minWidth ? { minWidth } : undefined}>{children}</table>;
}

export const rowClass = (state?: RowState) => (state ? `is-${state}` : undefined);

/** `n` shimmer rows for a table body (Orders: widths vary per row). */
export function SkeletonRows({ cols, n = 6 }: { cols: number; n?: number }) {
  const widths = ['70%', '55%', '82%', '64%', '48%', '76%', '58%', '68%'];
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <tr key={i} aria-hidden="true">
          <td colSpan={cols} className="ma-skel-cell"><span className="ma-skel" style={{ width: widths[i % widths.length] }} /></td>
        </tr>
      ))}
    </>
  );
}

/** Shimmer block on the page background (Dashboard loading: cards and panels). */
export function Skeleton({ height, radius = 24, width = '100%' }: { height: number; radius?: number; width?: number | string }) {
  return <div className="ma-skel on-bg" style={{ height, borderRadius: radius, width }} aria-hidden="true" />;
}
