/** Order labels shared by Dashboard, Orders, Order detail, Learner profile. */
import type { OwnerOrder } from '@/lib/types/owner-mock';
import type { Tone } from '../ui/chip';

export const STATUS: Record<string, { t: string; tone: Tone }> = {
  PENDING: { t: 'Tasdiq kutmoqda', tone: 'warn' },
  PAID: { t: "To'langan", tone: 'ok' },
  FAILED: { t: 'Muvaffaqiyatsiz', tone: 'err' },
  CANCELLED: { t: "Muddati o'tdi", tone: 'neutral' },
  REFUNDED: { t: 'Qaytarilgan', tone: 'err' },
};
export const statusOf = (s: string) => STATUS[s] ?? { t: s, tone: 'neutral' as Tone };

export const METHOD: Record<string, string> = { card: 'Karta / Paddle', wallet: 'Hamyon', local: "Mahalliy o'tkazma" };
export const methodOf = (o: Pick<OwnerOrder, 'methodGroup' | 'provider'>) =>
  METHOD[o.methodGroup] ?? (o.provider === 'manual' ? METHOD.local : o.provider === 'paddle' ? METHOD.card : o.methodGroup);

export const FAILURE: Record<string, string> = { DECLINED: 'Karta rad etildi', EXPIRED: "Muddati o'tdi" };

/**
 * Small line under the date (Orders "Yaratildi" column): pending age / time left, failure reason,
 * "48 s o'tdi" for an expired order.
 */
export function orderAge(o: OwnerOrder, now: number): { text: string; tone: 'mut' | 'warn' | 'err' } {
  if (o.status === 'PENDING') {
    const mins = Math.max(0, Math.floor((now - Date.parse(o.createdAt)) / 60000));
    const h = Math.floor(mins / 60);
    if (h >= 24 && o.expiresAt) {
      const left = Math.max(0, Math.floor((Date.parse(o.expiresAt) - now) / 3600000));
      return { text: `${h} soat · ${left} s qoldi`, tone: 'warn' };
    }
    return { text: h < 1 ? `${mins} daq oldin` : `${h} soat oldin`, tone: 'mut' };
  }
  if (o.status === 'FAILED') return { text: FAILURE[o.failureCode ?? ''] ?? 'Muvaffaqiyatsiz', tone: 'err' };
  if (o.status === 'CANCELLED') {
    const h = o.expiresAt ? Math.max(0, Math.round((Date.parse(o.expiresAt) - Date.parse(o.createdAt)) / 3600000)) : null;
    return { text: h ? `${h} s o'tdi` : '', tone: 'mut' };
  }
  return { text: '', tone: 'mut' };
}
