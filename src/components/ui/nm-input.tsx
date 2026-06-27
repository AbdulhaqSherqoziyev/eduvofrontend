import { forwardRef } from 'react';
import { Input, type InputProps } from './input';
import { cn } from '@/lib/utils/cn';

interface NmInputProps extends InputProps {
  /** Optional leading icon (e.g. a search or phone glyph). */
  icon?: React.ReactNode;
}

/** Inset (pressed-in) neomorphic text input. */
export const NmInput = forwardRef<HTMLInputElement, NmInputProps>(({ className, icon, ...props }, ref) => {
  const field = (
    <Input
      ref={ref}
      className={cn(
        'h-[50px] w-full rounded-ctl bg-background text-[14.5px] font-semibold text-foreground shadow-nm-inset',
        'px-4 placeholder:font-medium',
        icon ? 'pl-[47px]' : '',
        className,
      )}
      {...props}
    />
  );
  if (!icon) return field;
  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute left-[17px] top-1/2 -translate-y-1/2 text-[#9aa6b8]">
        {icon}
      </span>
      {field}
    </div>
  );
});
NmInput.displayName = 'NmInput';
