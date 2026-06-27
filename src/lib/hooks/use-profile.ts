import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profile';

const KEY = 'profile';

export function useProfile() {
  return useQuery({ queryKey: [KEY], queryFn: profileApi.get });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: profileApi.update,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: profileApi.changePassword });
}
