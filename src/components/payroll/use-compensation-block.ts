'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { can } from '@/lib/auth/permissions';
import { moduleOn } from '@/lib/auth/module-gate';
import { useCompensation, useRemoveCompensation, useSaveCompensation } from '@/lib/hooks/use-compensation';
import { apiErrorMessage } from '@/lib/utils/api-error';
import { currentPeriod, shiftPeriod } from '@/lib/utils/payroll-labels';
import type { CompensationView, SubjectType } from '@/lib/types/payroll';
import {
  draftFromRule, EMPTY_DRAFT, needsConfirm, toSaveInput, validateDraft,
  type CompDraft, type CompErrors,
} from './compensation-state';

/**
 * Yangi xodim formasida hali `CompensationView` yo'q — id xodim yaratilgandan
 * keyin tug'iladi. Oylar nomi uchun serverga borish shart emas: bu yerda pul
 * hisoblanmaydi, faqat "keyingi oy" nomlanadi.
 */
function blankView(subjectType: SubjectType): CompensationView {
  const period = currentPeriod();
  return {
    subjectType, subjectId: '', subjectName: '', subjectUserId: null,
    rule: null, activeRule: null,
    currentPeriod: period,
    defaultEffectiveFrom: '',
    defaultEffectiveFromPeriod: shiftPeriod(period, 1),
    currentPeriodStatus: null,
  };
}

/**
 * "Ish haqi" blokining boshqaruvi (§A).
 *
 * Blok o'zi saqlanmaydi — dialogning `Saqlash` tugmasi bilan saqlanadi, shuning
 * uchun holat shu yerda turadi va dialog faqat `save()` ni chaqiradi. Tasdiq
 * dialogi ham shu yerda: kamaytirish va "shu oydan qo'llash" ikkalasi ham
 * dialogning umumiy `Saqlash` oqimini to'xtatishi kerak (§A.7).
 */
export function useCompensationBlock(subjectType: SubjectType, subjectId: string | null) {
  const allowed = can('compensation.update') && moduleOn('payroll');
  const query = useCompensation(subjectType, subjectId, allowed);
  const save = useSaveCompensation(subjectType);
  const remove = useRemoveCompensation(subjectType);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CompDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<CompErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const touched = useRef(false);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const view = query.data ?? (subjectId ? undefined : blankView(subjectType));
  // Bonus atribusiyasi `Student.createdById` (User) orqali ketadi: loginsiz
  // o'qituvchiga bonus hech qachon tushmaydi va blok har oy "nega bonus yo'q?"
  // savolini tug'diradi [§A.5, T3]. Xodim esa ta'rifi bo'yicha login egasi.
  const withBonus = subjectType === 'USER' || !!view?.subjectUserId;

  // Server javobi kelgach formani bir marta to'ldiramiz. Foydalanuvchi allaqachon
  // yozayotgan bo'lsa tegmaymiz — xato holatida ham kiritilgani yo'qolmasin [I/54].
  useEffect(() => {
    if (query.data && !touched.current) {
      setDraft(draftFromRule(query.data));
      if (query.data.rule) setOpen(true);
    }
  }, [query.data]);

  const patch = useCallback((p: Partial<CompDraft>) => {
    touched.current = true;
    setDraft((prev) => ({ ...prev, ...p }));
    setErrors({});
  }, []);

  const run = useCallback(
    async (targetId: string) => {
      if (!view) return false;
      setSaveError(null);
      try {
        await save.mutateAsync({ subjectId: targetId, input: toSaveInput(draft, view, withBonus) });
        touched.current = false;
        return true;
      } catch (error) {
        setSaveError(
          apiErrorMessage(error, "Server javob bermadi. Qoida saqlanmadi — qayta urinib ko'ring."),
        );
        setOpen(true);
        return false;
      }
    },
    [draft, save, view, withBonus],
  );

  /**
   * Dialog `Saqlash` bosganda chaqiriladi. Qoida hech qachon tegilmagan bo'lsa
   * (blok ochilmagan, maydonlar bo'sh) — hech narsa yubormaymiz: bo'sh blok
   * "qoidani o'chirish" degani emas.
   */
  const submit = useCallback(
    async (targetId: string): Promise<boolean> => {
      if (!allowed || !touched.current) return true;
      const found = validateDraft(draft, withBonus);
      if (Object.keys(found).length) {
        setErrors(found);
        setOpen(true);
        return false;
      }
      if (needsConfirm(draft, view)) {
        setConfirmOpen(true);
        return new Promise<boolean>((resolve) => {
          resolver.current = async (ok) => resolve(ok ? await run(targetId) : false);
        });
      }
      return run(targetId);
    },
    [allowed, draft, view, run, withBonus],
  );

  const resolveConfirm = useCallback((ok: boolean) => {
    setConfirmOpen(false);
    const fn = resolver.current;
    resolver.current = null;
    fn?.(ok);
  }, []);

  const removeRule = useCallback(async () => {
    if (!subjectId) return;
    await remove.mutateAsync(subjectId);
    touched.current = false;
    setDraft(EMPTY_DRAFT);
    setOpen(false);
  }, [remove, subjectId]);

  return {
    allowed, query, view, draft, errors, open, setOpen, patch, withBonus,
    submit, confirmOpen, resolveConfirm, removeRule,
    pending: save.isPending || remove.isPending,
    saveError,
  };
}

export type CompensationBlockCtl = ReturnType<typeof useCompensationBlock>;
