/** Tenant-side "Tarif va modullar" — mirrors TenantModulesView on the backend. */

/**
 * WHY a module is open. The UI reads ONLY this to decide status, price and
 * button (spec §B.3.2) — never `isCore` or `monthlyFee`, because "has a price"
 * and "the center pays that price" are different questions.
 */
export type ModuleSource = 'core' | 'plan' | 'addon' | 'trial' | 'grandfather' | null;

/** Workflow grouping shared with the landing page. Unknown/missing = ungrouped. */
export type ModuleBundle = 'daily' | 'team' | 'money' | 'comms' | 'growth';

/** Group headings, in the order the catalogue presents them. */
export const BUNDLE_LABELS: Record<ModuleBundle, string> = {
  daily: 'Kundalik ish',
  team: 'Jamoa',
  money: 'Pul',
  comms: "Aloqa va ota-onalar",
  growth: "O'sish",
};

export const BUNDLE_ORDER: ModuleBundle[] = ['daily', 'team', 'money', 'comms', 'growth'];

export interface TenantModule {
  key: string;
  nameUz: string;
  benefitUz: string;
  /** Catalogue list price. 0 when `showPrices` is false — never render it then. */
  monthlyFee: number;
  isCore: boolean;
  /** Usable right now. During a trial every module is enabled. */
  enabled: boolean;
  /** Inside the paid selection — differs from `enabled` during a trial. */
  selected: boolean;
  /** Pulled from sale by ERS but still working here — one-way door, no button. */
  retired: boolean;
  source: ModuleSource;
  /** True only for a paid add-on the current user may switch off. */
  canDisable: boolean;
  /** Workflow group. May be null — render those last, never drop them. */
  bundle: string | null;
}

export interface TrialInfo {
  active: boolean;
  endsAt: string | null;
  daysLeft: number;
}

export interface ModulesOverview {
  /** All modules open on an old/negotiated price — read-only screen (§B.4). */
  grandfathered: boolean;
  trial: TrialInfo;
  planName: string | null;
  /** What the center pays per month today. 0 when prices are hidden. */
  monthlyFee: number;
  /**
   * This user is the center's management, so /modules has something to show
   * them. True for a grandfathered director too — wider than `canManage`.
   */
  canView: boolean;
  canManage: boolean;
  /** False -> every price in this payload is 0 and must not be rendered. */
  showPrices: boolean;
  modules: TenantModule[];
}

export interface ModuleFeeChange {
  previousMonthlyFee: number;
  newMonthlyFee: number;
}

export type ModulesPatchResult = ModulesOverview & ModuleFeeChange;

export interface ToggleModuleInput {
  key: string;
  enabled: boolean;
}
