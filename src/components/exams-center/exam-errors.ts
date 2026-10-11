import { formatSom } from '@/lib/utils/format';

/** Error body of `/api/exams/*`: `{ statusCode, error: CODE, message, ...extra }`. */
interface ExamErrorBody {
  statusCode?: number; error?: string; message?: string | string[];
  requiredUzs?: number; balanceUzs?: number; requiredCredits?: number; credits?: number;
}

export function examErrorBody(e: unknown): { status: number | null; body: ExamErrorBody } {
  const res = (e as { response?: { status?: number; data?: ExamErrorBody } } | null)?.response;
  return { status: res?.status ?? null, body: res?.data ?? {} };
}

export function examErrorCode(e: unknown): string | null {
  return examErrorBody(e).body.error ?? null;
}

/** 402 INSUFFICIENT_CREDITS extras (assign / attempt). */
export function insufficientCredits(e: unknown): { requiredCredits: number; credits: number } | null {
  const { body } = examErrorBody(e);
  if (body.error !== 'INSUFFICIENT_CREDITS') return null;
  return { requiredCredits: body.requiredCredits ?? 0, credits: body.credits ?? 0 };
}

/**
 * Human message for a failed exam request. The exam module writes its 4xx
 * messages as Uzbek UI copy (exam-errors.ts on the backend), so those are shown
 * as-is; 5xx and network failures get a fixed line instead of framework text.
 */
export function examErrorText(e: unknown, fallback = "Amalni bajarib bo'lmadi. Qayta urinib ko'ring."): string {
  const { status, body } = examErrorBody(e);
  if (status == null) return "Internet aloqasini tekshirib, qayta urinib ko'ring.";
  if (body.error === 'INSUFFICIENT_CREDITS') {
    return `Kredit yetarli emas: kerak ${body.requiredCredits ?? 0} kredit, mavjud ${body.credits ?? 0} kredit.`;
  }
  if (body.error === 'INSUFFICIENT_BALANCE') {
    const bal = body.balanceUzs ?? 0;
    return `Hamyonda mablag' yetarli emas: kerak ${formatSom(body.requiredUzs ?? 0)}, mavjud ${bal < 0 ? '−' : ''}${formatSom(bal)}.`;
  }
  if (status >= 500) return fallback;
  const msg = Array.isArray(body.message) ? body.message[0] : body.message;
  return msg || fallback;
}
