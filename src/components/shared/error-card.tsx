'use client';

import { AlertTriangle } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';

interface ErrorCardProps {
  /** User-facing message (uz/ru). Never render raw stack traces. */
  message?: string;
  onRetry?: () => void;
}

/** Small error surface with an optional retry action. */
export function ErrorCard({ message = "Ma'lumotni yuklab bo'lmadi.", onRetry }: ErrorCardProps) {
  return (
    <NmCard className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-[rgba(228,87,76,0.13)] text-danger">
        <AlertTriangle className="size-6" />
      </div>
      <div className="text-[14px] font-bold text-foreground">{message}</div>
      {onRetry ? (
        <NmButton variant="soft" size="sm" onClick={onRetry}>
          Qayta urinish
        </NmButton>
      ) : null}
    </NmCard>
  );
}
