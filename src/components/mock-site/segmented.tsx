'use client';
/** Segmented control (Design System): inset track, active item raised. Items may carry a trailing pill ("Soon"). */
import type { CSSProperties, ReactNode } from 'react';

export interface SegItem<K extends string> { key: K; label: ReactNode; pill?: ReactNode; disabled?: boolean }

export function Segmented<K extends string>({ items, value, onChange, label, style, btnStyle, grid }: {
  items: Array<SegItem<K>>; value: K; onChange: (k: K) => void; label: string; style?: CSSProperties; btnStyle?: CSSProperties; grid?: boolean;
}) {
  return (
    <div className="m-seg" role="group" aria-label={label} style={{ ...(grid ? { display: 'grid', gridTemplateColumns: `repeat(${items.length},1fr)` } : {}), ...style }}>
      {items.map((it) => (
        <button key={it.key} type="button" className="m-seg__btn" aria-pressed={value === it.key} aria-disabled={it.disabled || undefined}
          onClick={() => onChange(it.key)} style={btnStyle}>
          {it.label}{it.pill}
        </button>
      ))}
    </div>
  );
}
