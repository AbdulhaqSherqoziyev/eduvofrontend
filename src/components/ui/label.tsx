import { cn } from '@/lib/utils/cn';

/** Small uppercase field label in the neomorphic style. */
export function FieldLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('mb-2.5 block text-[11px] font-bold uppercase tracking-[0.9px] text-muted', className)}
      {...props}
    />
  );
}
