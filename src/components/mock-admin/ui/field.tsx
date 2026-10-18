/** Inputs (Admin Components.dc.html · INPUTLAR): inset field, error = 2px err ring + message below. */
import { forwardRef, useId } from 'react';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; big?: boolean }>(
  function Input({ invalid, big, className, ...rest }, ref) {
    const c = ['ma-input', big && 's-48', invalid && 'is-error', className].filter(Boolean).join(' ');
    return <input ref={ref} className={c} aria-invalid={invalid || undefined} {...rest} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  function Textarea({ invalid, className, rows = 3, ...rest }, ref) {
    const c = ['ma-textarea', invalid && 'is-error', className].filter(Boolean).join(' ');
    return <textarea ref={ref} rows={rows} className={c} aria-invalid={invalid || undefined} {...rest} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...rest }, ref) {
  return <select ref={ref} className={`ma-select${className ? ` ${className}` : ''}`} {...rest} />;
});

/**
 * Label + control + error. `children` gets the ids through a render function so the error is
 * announced (aria-describedby).
 */
export function Field({ label, error, small, children }: {
  label?: React.ReactNode;
  error?: React.ReactNode;
  /** 12px error text (inside cards) instead of 13px (forms) */
  small?: boolean;
  children: (ids: { id: string; describedBy?: string }) => React.ReactNode;
}) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div className="ma-field">
      {label && <label className="ma-label" htmlFor={id}>{label}</label>}
      {children({ id, describedBy: error ? errId : undefined })}
      {error && <span id={errId} className={`ma-field-error${small ? ' s-sm' : ''}`} role="alert">{error}</span>}
    </div>
  );
}
