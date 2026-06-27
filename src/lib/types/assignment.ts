import type { PillTone } from '@/components/shared/status-pill';

export type AssignmentStatus = 'ACTIVE' | 'COMPLETED';

export interface AssignmentFile {
  id: string;
  name: string;
  url: string;
  size?: number;
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  groupId: string;
  groupName: string;
  dueDate: string;
  submittedCount: number;
  totalCount: number;
  status: AssignmentStatus;
  files?: AssignmentFile[];
}

export interface CreateAssignmentInput {
  title: string;
  description?: string;
  groupId: string;
  dueDate: string;
  fileIds?: string[];
}

export interface AssignmentListParams {
  groupId?: string;
  page?: number;
  limit?: number;
}

export const ASSIGNMENT_STATUS_META: Record<AssignmentStatus, { label: string; tone: PillTone }> = {
  ACTIVE: { label: 'Faol', tone: 'primary' },
  COMPLETED: { label: 'Yakunlandi', tone: 'success' },
};
