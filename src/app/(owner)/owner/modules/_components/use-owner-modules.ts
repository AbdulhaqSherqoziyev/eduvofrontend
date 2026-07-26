import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ownerModulesApi, type OwnerModule, type UpdateModuleInput } from '@/lib/api/owner-modules';

const KEY = 'owner-modules';

export function useOwnerModules() {
  return useQuery({ queryKey: [KEY], queryFn: ownerModulesApi.list });
}

/**
 * PATCH one catalogue row. The response already carries the recomputed
 * tenantCount/monthlyRevenue, so it is written straight into the cache — the
 * card behind the dialog flips to the new state without a refetch flicker.
 */
export function useUpdateModule(key: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateModuleInput) => ownerModulesApi.update(key, input),
    onSuccess: (row) => {
      qc.setQueryData<OwnerModule[]>([KEY], (old) =>
        old?.map((m) => (m.key === row.key ? row : m)),
      );
      void qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}
