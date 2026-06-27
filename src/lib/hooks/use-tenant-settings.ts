import { useQuery } from '@tanstack/react-query';
import { tenantApi } from '../api/tenant';

const KEY = 'tenant-settings';

/** Fetch + cache the tenant settings (long staleTime — rarely change). */
export function useTenantSettings() {
  return useQuery({ queryKey: [KEY], queryFn: tenantApi.settings, staleTime: 5 * 60_000 });
}

/** Mode-aware UI flags derived from tenant settings (safe defaults while loading). */
export function useTenantFlags() {
  const { data } = useTenantSettings();
  return {
    studentsEnabled: data?.studentsEnabled ?? true,
    teacherOnlyMode: data?.teacherOnlyMode ?? false,
    parentsEnabled: data?.parentsEnabled ?? true,
    parentNotify: data?.parentNotify ?? true,
  };
}
