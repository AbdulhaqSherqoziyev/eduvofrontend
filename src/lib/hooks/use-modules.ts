'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { modulesApi } from '../api/modules';
import { setModuleGate } from '../auth/module-gate';
import type { ModulesOverview, ToggleModuleInput } from '../types/module';

const KEY = 'modules';

/**
 * The center's plan + modules. Every logged-in user may call it (a teacher on a
 * locked screen needs the module's name), and each answer also refreshes the
 * synchronous nav gate.
 */
export function useModulesOverview() {
  const query = useQuery({
    queryKey: [KEY],
    queryFn: modulesApi.overview,
    staleTime: 5 * 60_000,
  });
  const { data } = query;
  useEffect(() => {
    if (data) setModuleGate(data);
  }, [data]);
  return query;
}

/** Price a toggle before the user commits. Read-only despite being a POST. */
export function usePreviewModule(input: ToggleModuleInput, enabled: boolean) {
  return useQuery({
    queryKey: ['module-preview', input.key, input.enabled],
    queryFn: () => modulesApi.preview(input),
    enabled,
    retry: 0,
    gcTime: 0,
    staleTime: 0,
  });
}

/**
 * Switch one module on/off.
 *
 * Deliberately NOT optimistic (spec §B.7.3): money is changing, and a price
 * that shows then rolls back destroys trust. The PATCH answer is the new truth
 * for both the screen and the nav gate; everything else is invalidated because
 * a screen that was 403-locked a second ago may now be open.
 */
export function useToggleModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ToggleModuleInput) => modulesApi.toggle(input),
    onSuccess: (data) => {
      setModuleGate(data);
      qc.setQueryData<ModulesOverview>([KEY], data);
      qc.invalidateQueries();
    },
  });
}

/**
 * Did the trial end within the last 7 days? Drives the one-off "your trial
 * ended" message (§B.5.4).
 *
 * `!grandfathered` is mandatory: the modules migration can leave a stale
 * `trialEndsAt` on an old tenant that lost nothing, and telling that director
 * "your sections were closed" is a panic with no cause.
 */
export function trialJustEnded(view: ModulesOverview | undefined): boolean {
  if (!view || view.grandfathered || view.trial.active || !view.trial.endsAt) return false;
  const ended = new Date(view.trial.endsAt).getTime();
  if (Number.isNaN(ended)) return false;
  const days = (Date.now() - ended) / 86_400_000;
  return days >= 0 && days <= 7;
}
