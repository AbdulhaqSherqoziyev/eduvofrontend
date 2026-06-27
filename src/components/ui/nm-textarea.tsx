import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

type NmTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/** Inset neomorphic textarea. */
export const NmTextarea = forwardRef<HTMLTextAreaElement, NmTextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full rounded-ctl bg-background p-4 text-[14.5px] font-semibold text-foreground shadow-nm-inset',
      'outline-none font-sans resize-none placeholder:font-medium',
      className,
    )}
    {...props}
  />
));
NmTextarea.displayName = 'NmTextarea';
