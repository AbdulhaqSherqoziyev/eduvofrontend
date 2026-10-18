'use client';
/** Stepper, segmented control, toggle (Admin Components.dc.html · STEPPER · SEGMENT · TOGGLE). */

export function Stepper({ value, onChange, min = 0, max = Infinity, label }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; label: string;
}) {
  return (
    <div className="ma-stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Kamaytirish">−</button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Ko'paytirish">+</button>
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange, label, small }: {
  options: readonly { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string;
  /** 32px items (Dashboard period switch) instead of 34px */
  small?: boolean;
}) {
  return (
    <div className={`ma-seg${small ? ' s-32' : ''}`} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" className="ma-toggle" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}>
      <span />
    </button>
  );
}
