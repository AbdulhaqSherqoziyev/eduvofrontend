'use client';

import Link from 'next/link';
import { CheckCircle2, ChevronRight, Circle, X } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { useDismissOnboarding, useOnboardingStatus } from '@/lib/hooks/use-onboarding';
import type { OnboardingStatus } from '@/lib/api/onboarding';

const STEPS: { key: keyof Omit<OnboardingStatus, 'dismissed'>; label: string; href: string }[] = [
  { key: 'hasTeacher', label: "O'qituvchi qo'shing", href: '/teachers' },
  { key: 'hasGroup', label: 'Guruh oching', href: '/groups' },
  { key: 'hasStudents', label: "O'quvchi qo'shing", href: '/students' },
  { key: 'hasPayment', label: "Birinchi to'lovni kiriting", href: '/payments' },
];

/**
 * First-steps checklist on the dashboard home. Admin-only endpoint: on any
 * error (incl. 403 for non-admins) the card silently hides. No percentages,
 * no deadlines — just four simple steps and an always-visible dismiss.
 */
export function OnboardingCard() {
  const query = useOnboardingStatus();
  const dismiss = useDismissOnboarding();

  if (query.isLoading || query.isError || query.data === undefined) return null;
  const s = query.data;
  if (s.dismissed) return null;
  if (STEPS.every((step) => s[step.key])) return null;

  return (
    <NmCard className="col-span-1 sm:col-span-2 md:col-span-12 p-[22px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[16px] font-extrabold tracking-[-0.3px] text-foreground">
            Boshlash uchun 4 qadam
          </div>
          <div className="mt-0.5 text-[13px] font-semibold text-muted">
            Markazingizni ishga tushirish uchun quyidagilarni bajaring
          </div>
        </div>
        <NmIconButton
          aria-label="Yopish"
          onClick={() => dismiss.mutate()}
          disabled={dismiss.isPending}
        >
          <X className="size-4" />
        </NmIconButton>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STEPS.map((step) => {
          const done = s[step.key];
          return (
            <Link
              key={step.key}
              href={step.href}
              className="flex items-center gap-3 rounded-[14px] bg-background px-4 py-3.5 shadow-nm-sm nm-pressable"
            >
              {done ? (
                <CheckCircle2 className="size-5 shrink-0 text-success" />
              ) : (
                <Circle className="size-5 shrink-0 text-muted" />
              )}
              <span
                className={
                  done
                    ? 'flex-1 text-[13px] font-bold text-muted'
                    : 'flex-1 text-[13px] font-bold text-foreground'
                }
              >
                {step.label}
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted" />
            </Link>
          );
        })}
      </div>
    </NmCard>
  );
}
