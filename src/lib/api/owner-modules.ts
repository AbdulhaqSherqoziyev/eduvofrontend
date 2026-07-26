import { api } from './client';

/** One row of the platform module catalogue as the OWNER panel sees it. */
export interface OwnerModule {
  key: string;
  nameUz: string;
  nameRu: string;
  benefitUz: string;
  benefitRu: string;
  monthlyFee: number;
  /** Code-level contract — never editable from the UI. */
  isCore: boolean;
  /** Module keys this one needs to work. Read-only. */
  requires: string[];
  bundle: string;
  sortOrder: number;
  /** false = withdrawn from sale; centers that already have it keep working. */
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** Centers where the module is switched on right now (trials included). */
  tenantCount: number;
  /** Monthly take from ACTIVE/GRACE subscriptions only; 0 for core modules. */
  monthlyRevenue: number;
}

/** OWNER-editable fields. `isCore`/`requires`/`key`/`bundle` are deliberately absent. */
export interface UpdateModuleInput {
  monthlyFee?: number;
  nameUz?: string;
  nameRu?: string;
  benefitUz?: string;
  benefitRu?: string;
  isActive?: boolean;
  sortOrder?: number;
}

/** Bundle group names (Sevara wording, shared with the landing picker). */
export const BUNDLE_LABELS: Record<string, string> = {
  daily: 'Kundalik ish',
  team: 'Jamoa',
  money: 'Pul',
  comms: "Aloqa va ota-onalar",
  growth: "O'sish",
};

export const BUNDLE_ORDER = ['daily', 'team', 'money', 'comms', 'growth'];

export function bundleLabel(bundle: string): string {
  return BUNDLE_LABELS[bundle] ?? bundle;
}

/** Platform module catalogue (OWNER only — `module.read` / `module.update`). */
export const ownerModulesApi = {
  list: () => api.get<OwnerModule[]>('/platform/modules').then((r) => r.data),
  update: (key: string, input: UpdateModuleInput) =>
    api.patch<OwnerModule>(`/platform/modules/${key}`, input).then((r) => r.data),
};
