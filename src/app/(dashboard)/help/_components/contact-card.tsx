import { Headset, Phone } from 'lucide-react';
import { NmButton } from '@/components/ui/nm-button';
import { NmCard } from '@/components/ui/nm-card';
import { cn } from '@/lib/utils/cn';
import { SUPPORT_PHONE, SUPPORT_TEXT } from '@/lib/help/constants';
import { FOCUS } from './styles';

/** "Javob topmadingizmi?" — one constant, no sales wording (§11). */
export function ContactCard({ className }: { className?: string }) {
  return (
    <NmCard className={cn('p-5', className)}>
      <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-foreground">
        <Headset className="size-5 shrink-0 text-primary" aria-hidden />
        Javob topmadingizmi?
      </h2>
      <p className="mt-1.5 text-[13.5px] font-semibold leading-[1.55] text-foreground">{SUPPORT_TEXT}</p>
      {SUPPORT_PHONE ? (
        <>
          <p className="mt-3 text-[13.5px] font-semibold text-foreground">Yoki ERS yordam xizmatiga qo&apos;ng&apos;iroq qiling:</p>
          <NmButton asChild variant="soft" size="md" className={cn('mt-2 h-11 w-full sm:w-auto', FOCUS)}>
            <a href={`tel:${SUPPORT_PHONE.replace(/[^\d+]/g, '')}`}>
              <Phone className="size-4" aria-hidden />
              {SUPPORT_PHONE}
            </a>
          </NmButton>
        </>
      ) : null}
    </NmCard>
  );
}
