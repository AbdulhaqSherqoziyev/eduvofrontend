import type { PillTone } from '@/components/shared/status-pill';

export type InvoiceStatus = 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE';
export type PaymentMethod = 'CASH' | 'CLICK' | 'PAYME';

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  period: string;
  amount: number;
  paidAmount: number;
  status: InvoiceStatus;
}

export interface PaymentSummary {
  collected: number;
  outstanding: number;
  overdue: number;
}

export interface AcceptPaymentInput {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
}

export interface InvoiceListParams {
  search?: string;
  status?: InvoiceStatus;
  page?: number;
  limit?: number;
}

export const INVOICE_STATUS_META: Record<InvoiceStatus, { label: string; tone: PillTone }> = {
  PAID: { label: "To'langan", tone: 'success' },
  PARTIAL: { label: 'Qisman', tone: 'warning' },
  UNPAID: { label: "To'lanmagan", tone: 'muted' },
  OVERDUE: { label: "Muddati o'tgan", tone: 'danger' },
};

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Naqd' },
  { value: 'CLICK', label: 'Click' },
  { value: 'PAYME', label: 'Payme' },
];
