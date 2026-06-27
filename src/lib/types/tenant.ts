/** Tenant settings — toggles that change available behavior (not permissions). */
export interface TenantSettings {
  id: string;
  name: string;
  slug: string;
  currency: string;
  paymentDueDay: number;
  studentsEnabled: boolean;
  teacherOnlyMode: boolean;
  parentsEnabled: boolean;
  parentNotify: boolean;
}
