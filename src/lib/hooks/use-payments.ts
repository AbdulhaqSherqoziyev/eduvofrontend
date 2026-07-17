import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../api/payments';
import type { InvoiceListParams } from '../types/payment';

const KEY = 'invoices';
const SUMMARY_KEY = 'payment-summary';

export function useInvoices(params: InvoiceListParams) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => paymentsApi.invoices(params) });
}

export function usePaymentSummary() {
  return useQuery({ queryKey: [SUMMARY_KEY], queryFn: paymentsApi.summary });
}

export function useAcceptPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.accept,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [SUMMARY_KEY] });
    },
  });
}

export function useAcceptStudentPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.acceptStudent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [SUMMARY_KEY] });
      qc.invalidateQueries({ queryKey: ['students'] });
    },
  });
}
