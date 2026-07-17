import type { PillTone } from '@/components/shared/status-pill';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'TRIAL' | 'CONVERTED' | 'LOST';

export interface Lead {
  id: string;
  fullName: string;
  phone: string;
  status: LeadStatus;
  source?: string;
  note?: string;
  createdAt: string;
}

export interface CreateLeadInput {
  fullName: string;
  phone: string;
  source?: string;
  note?: string;
}

export interface UpdateLeadInput {
  status?: LeadStatus;
  note?: string;
}

export interface LeadListParams {
  status?: LeadStatus;
  page?: number;
  limit?: number;
}

/** Student summary returned when a lead becomes a student. */
export interface ConvertLeadResponse {
  student: { id: string; seq: number; fullName: string; phone: string; status: string; createdAt: string };
  lead: Lead;
}

/** Simple Uzbek labels (Sevara: no CRM jargon). */
export const LEAD_STATUS_META: Record<LeadStatus, { label: string; tone: PillTone }> = {
  NEW: { label: 'Yangi', tone: 'primary' },
  CONTACTED: { label: "Bog'lanildi", tone: 'warning' },
  TRIAL: { label: 'Sinov darsida', tone: 'muted' },
  CONVERTED: { label: "O'quvchi bo'ldi", tone: 'success' },
  LOST: { label: "Yo'qotildi", tone: 'danger' },
};

/** The four board columns (LOST lives behind its own small tab). */
export const LEAD_BOARD_COLUMNS: LeadStatus[] = ['NEW', 'CONTACTED', 'TRIAL', 'CONVERTED'];
