import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { onboardingApi, type OnboardingStatus } from '../api/onboarding';

const KEY = 'onboarding';

/**
 * Onboarding checklist status. Admin-only endpoint — non-admins get 403,
 * so we never retry and let the card hide itself on error.
 */
export function useOnboardingStatus() {
  return useQuery({ queryKey: [KEY], queryFn: onboardingApi.status, retry: false, staleTime: 60_000 });
}

export function useDismissOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: onboardingApi.dismiss,
    onSuccess: () => {
      qc.setQueryData<OnboardingStatus>([KEY], (d) => (d ? { ...d, dismissed: true } : d));
    },
  });
}
