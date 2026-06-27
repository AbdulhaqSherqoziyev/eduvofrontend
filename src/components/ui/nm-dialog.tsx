'use client';

import { X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from './dialog';
import { cn } from '@/lib/utils/cn';

interface NmDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}

/** Floating neomorphic modal with a title row and a soft close button. */
export function NmDialog({ open, onOpenChange, trigger, title, children, className }: NmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className={className}>
        <div className="mb-6 flex items-center justify-between">
          <DialogTitle className="text-[19px] font-extrabold tracking-[-0.3px] text-foreground">
            {title}
          </DialogTitle>
          <DialogClose
            aria-label="Yopish"
            className={cn(
              'flex size-[38px] items-center justify-center rounded-[12px] bg-background',
              'text-muted shadow-nm-sm nm-pressable hover:text-danger',
            )}
          >
            <X className="size-[17px]" strokeWidth={2.2} />
          </DialogClose>
        </div>
        {children}
      </DialogContent>
    </Dialog>
  );
}
