/** Pull a human message out of an Axios/API error, falling back to a default. */
export function apiErrorMessage(error: unknown, fallback = 'Xatolik yuz berdi'): string {
  const data = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data;
  const msg = data?.message;
  if (Array.isArray(msg)) return msg[0] ?? fallback;
  return msg ?? fallback;
}
