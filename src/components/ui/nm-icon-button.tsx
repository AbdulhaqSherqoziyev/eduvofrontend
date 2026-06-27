import { forwardRef } from 'react';
import { Button, type ButtonProps } from './button';
import { cn } from '@/lib/utils/cn';

interface NmIconButtonProps extends ButtonProps {
  /** Hover tint: neutral primary (default) or danger (for destructive actions). */
  tone?: 'primary' | 'danger';
}

/** Soft circular/rounded-square icon button used in toolbars and rows. */
export const NmIconButton = forwardRef<HTMLButtonElement, NmIconButtonProps>(
  ({ tone = 'primary', className, ...props }, ref) => (
    <Button
      ref={ref}
      className={cn(
        'h-[34px] w-[34px] rounded-[11px] bg-background text-muted shadow-nm-sm nm-pressable',
        tone === 'danger' ? 'hover:text-danger' : 'hover:text-primary',
        className,
      )}
      {...props}
    />
  ),
);
NmIconButton.displayName = 'NmIconButton';
