import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { branchesApi } from '../api/branches';

const KEY = 'branches';

export function useBranches() {
  return useQuery({ queryKey: [KEY], queryFn: branchesApi.list });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: branchesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
