import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type NmSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

/** Inset neomorphic native <select> with a chevron. */
export const NmSelect = forwardRef<HTMLSelectElement, NmSelectProps>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        'h-[50px] w-full appearance-none rounded-ctl bg-background pl-4 pr-10 text-[14px]',
        'font-semibold text-foreground shadow-nm-inset outline-none font-sans cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
  </div>
));
NmSelect.displayName = 'NmSelect';
