'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils/cn';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

export function DialogOverlay({ className, ...props }: DialogPrimitive.DialogOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-[100] bg-[rgba(28,40,58,0.34)] backdrop-blur-[3px] animate-ovl',
        className,
      )}
      {...props}
    />
  );
}

export function DialogContent({ className, children, ...props }: DialogPrimitive.DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-[101] w-[520px] max-w-[calc(100vw-40px)] -translate-x-1/2 -translate-y-1/2',
          'rounded-[28px] bg-background p-7 shadow-[-10px_-10px_26px_rgba(255,255,255,0.6),12px_14px_40px_rgba(40,55,80,0.4)]',
          'animate-pop focus:outline-none max-h-[calc(100vh-60px)] overflow-y-auto',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
