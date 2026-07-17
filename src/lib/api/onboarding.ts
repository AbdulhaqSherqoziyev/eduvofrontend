import { api } from './client';

export interface OnboardingStatus {
  hasTeacher: boolean;
  hasGroup: boolean;
  hasStudents: boolean;
  hasPayment: boolean;
  dismissed: boolean;
}

export const onboardingApi = {
  status: () => api.get<OnboardingStatus>('/onboarding/status').then((r) => r.data),
  dismiss: () => api.post<{ dismissed: boolean }>('/onboarding/dismiss').then((r) => r.data),
};
