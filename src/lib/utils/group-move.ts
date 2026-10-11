import { apiErrorMessage } from './api-error';

/** Copy for moving a student between groups / adding one more group. */
export const MULTI_GROUP_MSG = "Bu o'quvchi bir nechta guruhda. Guruhni o'quvchi profilidan o'zgartiring.";
export const ALREADY_IN_GROUP_MSG = "O'quvchi bu guruhda allaqachon bor.";
export const GENERIC_FAIL_MSG = "Xatolik yuz berdi. Qayta urinib ko'ring.";
export const ADD_TO_GROUP = "Guruhga qo'shish";
export const MOVE_TO_GROUP = "Boshqa guruhga o'tkazish";
export const ADDED_MSG = "Qo'shildi.";
export const MOVED_MSG = "O'tkazildi.";
export const NO_OTHER_GROUP_MSG = "Boshqa guruh yo'q. Avval «Guruhlar» (Boshqaruv) da guruh oching.";
export const NOT_IN_FROM_GROUP_MSG = "O'quvchi bu guruhda endi yo'q. Sahifani yangilang.";

export const moveNote = (from: string, to: string) =>
  `«${from}» guruhidan «${to}» guruhiga o'tadi. Eski guruh kechagacha, yangisi bugundan hisoblanadi.`;
export const addNote = (group: string) =>
  `«${group}» guruhiga qo'shiladi. Narx — guruh narxi; kerak bo'lsa keyin «Narxni o'zgartirish».`;
/** Shown under moveNote when the student pays an own price in the group being left. */
export const customPriceMoveNote = (amount: string) =>
  `Alohida narx (${amount}) yangi guruhga o'tmaydi — u yerda guruh narxi bo'ladi.`;

/** Human text for a failed move/add. Every known code gets fixed copy. */
export function groupChangeError(error: unknown): string {
  const res = (error as { response?: { status?: number; data?: { code?: string; message?: string } } })?.response;
  const code = res?.data?.code;
  if (code === 'MULTI_GROUP') return MULTI_GROUP_MSG;
  if (code === 'ALREADY_IN_GROUP') return ALREADY_IN_GROUP_MSG;
  if (code === 'NOT_IN_FROM_GROUP') return NOT_IN_FROM_GROUP_MSG;
  return apiErrorMessage(error, GENERIC_FAIL_MSG);
}
