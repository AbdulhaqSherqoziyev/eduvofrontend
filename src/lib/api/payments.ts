import { api } from './client';
import { cleanParams } from './http';
import type { Paginated } from './http';
import type { AcceptPaymentInput, Invoice, InvoiceListParams, PaymentSummary } from '../types/payment';

export const paymentsApi = {
  invoices: (params: InvoiceListParams) =>
    api.get<Paginated<Invoice>>('/invoices', { params: cleanParams(params) }).then((r) => r.data),
  summary: () => api.get<PaymentSummary>('/payments/summary').then((r) => r.data),
  accept: (input: AcceptPaymentInput) => api.post('/payments', input).then((r) => r.data),
};
