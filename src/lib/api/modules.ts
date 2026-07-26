import { api } from './client';
import type {
  ModuleFeeChange,
  ModulesOverview,
  ModulesPatchResult,
  ToggleModuleInput,
} from '../types/module';

/**
 * The center's own plan + module catalogue.
 *
 * GET is readable by every logged-in user (the lock screen needs the module's
 * name), but prices come back zeroed unless the caller may manage the
 * subscription. `preview` is read-only despite being a POST — it prices a
 * toggle for the confirm dialog and writes nothing.
 */
export const modulesApi = {
  overview: () => api.get<ModulesOverview>('/modules').then((r) => r.data),
  preview: (input: ToggleModuleInput) =>
    api.post<ModuleFeeChange>('/modules/preview', input).then((r) => r.data),
  toggle: (input: ToggleModuleInput) =>
    api.patch<ModulesPatchResult>('/modules', input).then((r) => r.data),
};
