import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ownerApi } from '../api/owner';

const KEY = 'owner-applications';

export function useApplications() {
  return useQuery({ queryKey: [KEY], queryFn: ownerApi.applications });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: [KEY] });
    qc.invalidateQueries({ queryKey: ['owner-tenants'] });
  };
}

export function useApprove() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => ownerApi.approve(id), onSuccess: invalidate });
}

export function useReject() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (v: { id: string; reason: string }) => ownerApi.reject(v.id, v.reason),
    onSuccess: invalidate,
  });
}
