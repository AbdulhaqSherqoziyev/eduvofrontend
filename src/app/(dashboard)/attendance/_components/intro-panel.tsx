import { Check, Clock, X } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';

const ROWS = [
  {
    icon: Check,
    tone: 'text-success',
    text: 'Keldi — bitta urinishda butun guruhni belgilang.',
  },
  {
    icon: Clock,
    tone: 'text-warning',
    text: 'Kechikdi — kechikkan daqiqalarni kiriting.',
  },
  {
    icon: X,
    tone: 'text-danger',
    text: 'Kelmadi — sababsiz qoldirilgan darslar hisobga olinadi.',
  },
];

/** Left-side static guidance for the mobile attendance flow. */
export function IntroPanel() {
  return (
    <div className="max-w-[300px] pt-[30px]">
      <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-muted">
        MOBIL DAVOMAT
      </div>
      <h2 className="mt-2 text-[24px] font-extrabold leading-[1.2] tracking-[-0.3px] text-foreground">
        O'qituvchi telefoni orqali tezkor davomat
      </h2>
      <p className="mt-3 text-[14px] leading-[1.6] text-muted">
        Har bir o'quvchi uchun uchta katta tugma. Kechikkan o'quvchi uchun daqiqalarni
        kiriting. Belgilab, saqlang.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        {ROWS.map(({ icon: Icon, tone, text }) => (
          <NmCard key={text} inset className="flex items-center gap-3.5 p-[14px]">
            <div
              className={`flex size-9 flex-shrink-0 items-center justify-center rounded-full bg-background shadow-nm-sm ${tone}`}
            >
              <Icon className="size-[18px]" />
            </div>
            <p className="text-[13px] font-semibold leading-[1.45] text-[#5b6b82]">{text}</p>
          </NmCard>
        ))}
      </div>
    </div>
  );
}
