import { useEffect, useMemo, useRef, useState } from 'react';
import { formatNumber } from '@/lib/utils/format';
import { SCHEME_FIELDS } from '@/lib/utils/payroll-labels';
import type { CompensationInput, PreviewResponse } from '@/lib/types/payroll';
import { toRuleInput, type CompDraft } from './compensation-state';

/** Markaz ulushi shundan past bo'lsa §B.3 dagi fakt qatori chiqadi. */
export const LOW_MARGIN_RATIO = 0.2;

/** Misol so'ray oladigan holatdami — bo'sh formada so'rov yuborilmaydi (§B.5). */
export function hasPreviewInput(draft: CompDraft): boolean {
  const fields = SCHEME_FIELDS[draft.scheme];
  if (fields.base && !Number(draft.baseSalary || 0)) return false;
  if (fields.percent && !Number(draft.revenuePercent || 0)) return false;
  if (fields.perLesson && !Number(draft.perLessonRate || 0)) return false;
  return true;
}

/**
 * Misol so'rovining kechiktirilgan qiymati (§B.5).
 *
 * Maydonga yozilganda 400 ms, rejim almashganda DARHOL. Sabab bir xil emas:
 * yozish davomida har bosishda so'rov yuborish raqamlarni miltillatadi, rejim
 * almashishi esa direktorning "bu ikkisi nima farq qiladi?" savolining o'zi —
 * javob kechiksa u savolni tashlab ketadi.
 */
export function useDebouncedRule(draft: CompDraft, withBonus: boolean, assumed: string) {
  const rule = useMemo(() => toRuleInput(draft, withBonus), [draft, withBonus]);
  const [value, setValue] = useState<{ rule: CompensationInput; assumed: string }>({ rule, assumed });
  const prevScheme = useRef(draft.scheme);

  useEffect(() => {
    if (prevScheme.current !== draft.scheme) {
      prevScheme.current = draft.scheme;
      setValue({ rule, assumed });
      return;
    }
    const timer = setTimeout(() => setValue({ rule, assumed }), 400);
    return () => clearTimeout(timer);
  }, [rule, assumed, draft.scheme]);

  return value;
}

/**
 * Formula — SO'Z BILAN, matematik belgilarsiz (§B.2/B.7).
 *
 * `max(...)` dasturchi yozuvi; uni o'qigan direktor formulani emas, o'zining
 * bu ekranga aloqasi yo'qligini tushunadi.
 */
export function previewFormula(preview: PreviewResponse): string {
  const { formula, result, revenue, scheme } = preview;
  const base = formatNumber(formula.base);
  const share = formatNumber(formula.share);
  const collected = formatNumber(revenue);
  const staff = formatNumber(result.staff);

  if (scheme === 'PER_LESSON') {
    return `${formula.lessons ?? 0} dars × ${base} = ${staff}`;
  }
  if (!formula.percent) return `Har oy bir xil: ${base}`;
  if (!formula.base) return `Guruhlariga tushgan ${collected} ning ${formula.percent}% i → ${staff}`;
  if (scheme === 'SUM') {
    return `Tan oylik ${base} + guruhlariga tushgan ${collected} ning ${formula.percent}% i = ${share} · jami → ${staff}`;
  }
  return `Tan oylik ${base} · guruhlariga tushgan ${collected} ning ${formula.percent}% i = ${share} · kattasi olinadi → ${staff}`;
}
