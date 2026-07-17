import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ownerApi, type OverrideInput } from '../api/owner';
import type { CreateCenterInput } from '../types/owner';

const KEY = 'owner-tenants';

export function useOwnerTenants() {
  return useQuery({ queryKey: [KEY], queryFn: ownerApi.tenants });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: [KEY] });
    // Money/status moves also change the finance overview + platform feed.
    qc.invalidateQueries({ queryKey: ['owner-finance-overview'] });
    qc.invalidateQueries({ queryKey: ['owner-platform-txns'] });
  };
}

export function useCreateCenter() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (input: CreateCenterInput) => ownerApi.createTenant(input), onSuccess: invalidate });
}

export function useUpdateCenter(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { name?: string; domain?: string }) => ownerApi.updateTenant(id, input),
    onSuccess: invalidate,
  });
}

export function useArchiveCenter() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => ownerApi.archiveTenant(id), onSuccess: invalidate });
}

export function useRestoreCenter() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => ownerApi.restoreTenant(id), onSuccess: invalidate });
}

export function useTopup(tenantId: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (v: { amount: number; note?: string; method?: string }) => ownerApi.topup(tenantId, v.amount, v.note, v.method),
    onSuccess: invalidate,
  });
}

export function useSetStatus(tenantId: string) {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (status: string) => ownerApi.setStatus(tenantId, status), onSuccess: invalidate });
}

export function useOverride(tenantId: string) {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (input: OverrideInput) => ownerApi.override(tenantId, input), onSuccess: invalidate });
}
