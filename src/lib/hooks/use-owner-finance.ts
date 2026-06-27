import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ownerFinanceApi, type FinanceQuery } from '../api/owner-finance';

function useVoidInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['owner-platform-txns'] });
    qc.invalidateQueries({ queryKey: ['owner-tenant-txns'] });
    qc.invalidateQueries({ queryKey: ['owner-finance-overview'] });
    qc.invalidateQueries({ queryKey: ['owner-tenants'] });
  };
}

export function useVoidPlatformTxn() {
  const invalidate = useVoidInvalidate();
  return useMutation({ mutationFn: (id: string) => ownerFinanceApi.voidPlatformTxn(id), onSuccess: invalidate });
}

export function useVoidTenantTxn() {
  const invalidate = useVoidInvalidate();
  return useMutation({ mutationFn: (id: string) => ownerFinanceApi.voidTenantTxn(id), onSuccess: invalidate });
}

export function useFinanceOverview(tenantId?: string) {
  return useQuery({
    queryKey: ['owner-finance-overview', tenantId ?? null],
    queryFn: () => ownerFinanceApi.overview(tenantId),
  });
}

export function usePlatformTxns(q: FinanceQuery) {
  return useQuery({
    queryKey: ['owner-platform-txns', q],
    queryFn: () => ownerFinanceApi.platformTxns(q),
    placeholderData: (prev) => prev,
  });
}

export function useTenantTxns(q: FinanceQuery) {
  return useQuery({
    queryKey: ['owner-tenant-txns', q],
    queryFn: () => ownerFinanceApi.tenantTxns(q),
    placeholderData: (prev) => prev,
  });
}
