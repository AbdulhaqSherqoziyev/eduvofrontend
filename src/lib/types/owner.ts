/** Platform OWNER (ICAN) view types — mirror the backend platform layer. */

export type SubStatus = 'TRIAL' | 'ACTIVE' | 'GRACE' | 'SUSPENDED' | 'CANCELLED';

export interface OwnerSubscription {
  id: string;
  status: SubStatus;
  balance: number;
  planId: string | null;
  planName: string | null;
  modules: string[];
  effectiveMonthlyFee: number;
  effectiveSetupFee: number;
  discountPercent: number;
  customMonthlyFee: number | null;
  setupPaid: boolean;
  trialEndsAt: string | null;
  graceEndsAt: string | null;
  nextBillingAt: string | null;
}

export interface OwnerTenant {
  id: string;
  seq: number;
  name: string;
  slug: string;
  domain?: string | null;
  archived: boolean;
  createdAt: string;
  studentCount: number;
  userCount: number;
  subscription: OwnerSubscription | null;
}

export interface CreateCenterInput {
  centerName: string;
  directorName: string;
  phone: string;
  planId?: string;
}

export interface OwnerApplication {
  id: string;
  centerName: string;
  directorName: string;
  phone: string;
  requestedSlug: string;
  region?: string | null;
  studentsCount?: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface ProvisionResult {
  tenantId: string;
  slug: string;
  loginPhone: string;
  password: string;
}

export interface OwnerPlan {
  id: string;
  name: string;
  monthlyFee: number;
  setupFee: number;
  trialDays: number;
  minStudents: number | null;
  maxStudents: number | null;
  maxBranches: number | null;
  modules: string[];
  isActive: boolean;
  sortOrder: number;
}

export const SUB_STATUS_META: Record<SubStatus, { label: string; tone: 'success' | 'warning' | 'danger' | 'muted' | 'primary' }> = {
  TRIAL: { label: 'Sinov', tone: 'primary' },
  ACTIVE: { label: 'Faol', tone: 'success' },
  GRACE: { label: 'Muhlat', tone: 'warning' },
  SUSPENDED: { label: "To'xtatilgan", tone: 'danger' },
  CANCELLED: { label: 'Bekor', tone: 'muted' },
};
