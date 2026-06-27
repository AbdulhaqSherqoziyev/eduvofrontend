import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ownerApi } from '../api/owner';
import type { OwnerPlan } from '../types/owner';

const KEY = 'owner-plans';

export function usePlans() {
  return useQuery({ queryKey: [KEY], queryFn: ownerApi.plans });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: [KEY] });
}

export function useCreatePlan() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (input: Partial<OwnerPlan>) => ownerApi.createPlan(input), onSuccess: invalidate });
}

export function useUpdatePlan(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: Partial<OwnerPlan>) => ownerApi.updatePlan(id, input),
    onSuccess: invalidate,
  });
}
