/** OWNER cross-tenant financial oversight types — mirror the platform layer. */

export type PlatformTxnType = 'TOPUP' | 'MONTHLY_FEE' | 'SETUP_FEE' | 'ADJUSTMENT' | 'REFUND';

export interface PlatformTxn {
  id: string;
  tenantId: string;
  centerName: string;
  type: PlatformTxnType;
  amount: number;
  balanceAfter: number;
  period: string | null;
  note: string | null;
  createdAt: string;
}

export interface TenantTxn {
  id: string;
  tenantId: string;
  centerName: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  party: string;
  note: string;
  amount: number;
  method: string;
  date: string;
}

export interface FinanceOverview {
  platform: { balanceTotal: number; topupTotal: number; feeTotal: number; count: number };
  tenant: { income: number; expense: number; net: number; count: number };
}

type Tone = 'success' | 'danger' | 'warning' | 'primary' | 'muted';

export const PLATFORM_TXN_META: Record<PlatformTxnType, { label: string; tone: Tone }> = {
  TOPUP: { label: "To'ldirish", tone: 'success' },
  REFUND: { label: 'Qaytarish', tone: 'primary' },
  MONTHLY_FEE: { label: "Oylik to'lov", tone: 'danger' },
  SETUP_FEE: { label: "O'rnatish", tone: 'warning' },
  ADJUSTMENT: { label: 'Tuzatish', tone: 'muted' },
};
