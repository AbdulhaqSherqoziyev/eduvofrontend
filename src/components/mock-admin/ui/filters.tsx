'use client';
/**
 * List toolbar pieces from Admin Orders.dc.html: filter pill ("Usul  Hammasi ▾") with a small menu,
 * tab strip with counts, pager ("1–25 / 2 418" + page buttons + "Keyingi →").
 */
import { useEffect, useRef, useState } from 'react';
import { groupNum } from '@/lib/admin-mock/format';

export function FilterPill({ label, value, children, active, align = 'left', ariaLabel }: {
  label: string; value: string; active?: boolean; align?: 'left' | 'right'; ariaLabel?: string;
  /** menu body; gets `close` */
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);
  return (
    <div className="ma-filter" ref={wrap}>
      <button type="button" className={`ma-filter-btn${active ? ' is-set' : ''}`} aria-expanded={open} aria-haspopup="true" aria-label={ariaLabel} onClick={() => setOpen((o) => !o)}>
        {label && <span className="ma-filter-k">{label}</span>}{value}{label && <span className="ma-filter-caret" aria-hidden="true">▾</span>}
      </button>
      {open && <div className="ma-filter-menu" style={align === 'right' ? { left: 'auto', right: 0 } : undefined}>{children(() => setOpen(false))}</div>}
    </div>
  );
}

/** Option list inside a FilterPill menu. */
export function FilterOptions<T extends string>({ options, value, onPick }: {
  options: ReadonlyArray<{ value: T; label: string }>; value: T; onPick: (v: T) => void;
}) {
  return (
    <div role="menu" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {options.map((o) => (
        <button key={o.value} type="button" role="menuitemradio" aria-checked={o.value === value} className="ma-filter-opt" onClick={() => onPick(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onPick, label }: {
  tabs: ReadonlyArray<{ value: T; label: string; count?: number | string | null; warn?: boolean }>; value: T; onPick: (v: T) => void; label: string;
}) {
  return (
    <div className="ma-tabs" role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <button key={t.value} type="button" role="tab" aria-selected={t.value === value} onClick={() => onPick(t.value)}>
          {t.label}
          {t.count !== undefined && t.count !== null && (
            <span className={`ma-tab-count${t.warn ? ' is-warn' : ''}`}>{typeof t.count === 'number' ? groupNum(t.count) : t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Pager({ page, pageSize, total, shown, onPage }: { page: number; pageSize: number; total: number; shown: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = (page - 1) * pageSize + shown;
  const win: number[] = [];
  const start = Math.max(1, Math.min(page - 1, pages - 2));
  for (let p = start; p <= Math.min(pages, start + 2); p++) win.push(p);
  return (
    <div className="ma-pager">
      <span>{groupNum(from)}–{groupNum(to)} / {groupNum(total)}</span>
      {pages > 1 && (
        <nav style={{ display: 'flex', gap: 6 }} aria-label="Sahifalar">
          {page > 1 && <button type="button" className="ma-page" onClick={() => onPage(page - 1)}>← Oldingi</button>}
          {win.map((p) => (
            <button key={p} type="button" className={`ma-page${p === page ? ' is-on' : ''}`} aria-current={p === page ? 'page' : undefined} onClick={() => onPage(p)}>{p}</button>
          ))}
          {page < pages && <button type="button" className="ma-page" onClick={() => onPage(page + 1)}>Keyingi →</button>}
        </nav>
      )}
    </div>
  );
}
