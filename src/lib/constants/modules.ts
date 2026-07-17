/** Catalogue of toggleable product modules (plan inclusion + per-center override). */
export interface ModuleDef {
  key: string;
  label: string;
}

export const MODULES: ModuleDef[] = [
  { key: 'students', label: "O'quvchilar" },
  { key: 'groups', label: 'Guruhlar' },
  { key: 'attendance', label: 'Davomat' },
  { key: 'payments', label: "To'lovlar" },
  { key: 'assignments', label: 'Vazifalar' },
  { key: 'schedule', label: 'Dars jadvali' },
  { key: 'rooms', label: 'Xonalar' },
  { key: 'reports', label: 'Hisobotlar' },
  { key: 'parents', label: 'Ota-ona portali' },
  { key: 'telegram', label: 'Telegram bot' },
];

export function moduleLabel(key: string): string {
  return MODULES.find((m) => m.key === key)?.label ?? key;
}
