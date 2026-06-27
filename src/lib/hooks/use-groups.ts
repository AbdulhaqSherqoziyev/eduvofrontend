import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../api/groups';
import type { CreateGroupInput } from '../types/group';
import type { ListParams } from '../api/http';

const KEY = 'groups';

export function useGroups(params: ListParams = {}) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => groupsApi.list(params) });
}

export function useGroup(id: string) {
  return useQuery({ queryKey: [KEY, id], queryFn: () => groupsApi.get(id), enabled: !!id });
}

export function useGroupRoster(id: string) {
  return useQuery({ queryKey: [KEY, id, 'roster'], queryFn: () => groupsApi.roster(id), enabled: !!id });
}

/** {value,label} options for group selects in forms. */
export function useGroupOptions() {
  const { data } = useGroups({ pageSize: 100 });
  return (data?.items ?? []).map((g) => ({ value: g.id, label: g.name }));
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: [KEY] });
}

export function useCreateGroup() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: groupsApi.create, onSuccess: invalidate });
}

export function useUpdateGroup(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: Partial<CreateGroupInput>) => groupsApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteGroup() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: groupsApi.softDelete, onSuccess: invalidate });
}
