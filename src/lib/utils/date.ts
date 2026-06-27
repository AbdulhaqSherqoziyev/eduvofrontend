/** Date helpers — UZ/RU convention is DD.MM.YYYY. */

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** ISO string or Date -> "25.06.2026". Returns "—" for empty input. */
export function formatDate(input?: string | Date | null): string {
  if (!input) return '—';
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '—';
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

/** ISO string or Date -> "25.06.2026 14:20". */
export function formatDateTime(input?: string | Date | null): string {
  if (!input) return '—';
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '—';
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
