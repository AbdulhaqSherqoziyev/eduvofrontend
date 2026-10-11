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
  /** Cash desk (§C.1 / §A.3). `openingAt: null` = the balance is not set yet. */
  expenseApprovalLimit: number;
  cashOpening: number;
  cardOpening: number;
  openingAt: string | null;
  /** Homework scale (§A.14): 0 = not scored, otherwise the maximum score for NEW assignments. */
  homeworkScale: number;
  /** TWO | THREE — stored for a later wave, not shown in the UI. */
  homeworkMode: 'TWO' | 'THREE';
}
