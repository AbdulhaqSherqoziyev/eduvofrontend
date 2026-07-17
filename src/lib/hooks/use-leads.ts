import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../api/leads';
import type { LeadListParams, UpdateLeadInput } from '../types/lead';

const KEY = 'leads';

export function useLeads(params: LeadListParams) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => leadsApi.list(params) });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: [KEY] });
}

export function useCreateLead() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: leadsApi.create, onSuccess: invalidate });
}

export function useUpdateLead() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLeadInput }) => leadsApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteLead() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: leadsApi.remove, onSuccess: invalidate });
}

/** Convert a lead into a student — refreshes both leads and students lists. */
export function useConvertLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.convert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['students'] });
    },
  });
}
