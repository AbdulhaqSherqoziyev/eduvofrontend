import { forwardRef } from 'react';
import { Button, type ButtonProps } from './button';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'soft' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-grad-primary text-white shadow-nm-primary nm-pressable',
  soft: 'bg-background text-primary shadow-nm-sm nm-pressable',
  ghost: 'bg-transparent text-muted hover:text-primary',
  danger: 'bg-background text-danger shadow-nm-sm nm-pressable',
};

const sizes: Record<Size, string> = {
  sm: 'h-[38px] px-4 text-[12.5px] rounded-ctl',
  md: 'h-[46px] px-5 text-[14px] rounded-ctl',
  lg: 'h-[54px] px-6 text-[15px] rounded-[15px]',
};

export interface NmButtonProps extends ButtonProps {
  variant?: Variant;
  size?: Size;
}

/** Primary neomorphic button (wraps the shadcn base Button). */
export const NmButton = forwardRef<HTMLButtonElement, NmButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => (
    <Button ref={ref} className={cn(variants[variant], sizes[size], className)} {...props} />
  ),
);
NmButton.displayName = 'NmButton';
