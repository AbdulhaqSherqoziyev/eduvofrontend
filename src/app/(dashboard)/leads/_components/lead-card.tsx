'use client';

import { useState } from 'react';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import { Phone, Trash2, UserCheck } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { NmSelect } from '@/components/ui/nm-select';
import { StatusPill } from '@/components/shared/status-pill';
import { Can } from '@/components/shared/can';
import { useConvertLead, useDeleteLead, useUpdateLead } from '@/lib/hooks/use-leads';
import { LEAD_STATUS_META, type Lead, type LeadStatus } from '@/lib/types/lead';

/** Statuses selectable by hand — CONVERTED only happens via the convert flow. */
const SELECTABLE: LeadStatus[] = ['NEW', 'CONTACTED', 'TRIAL', 'LOST'];

interface ConvertUiState {
  kind: 'success' | 'duplicate' | 'error';
  message: string;
  studentId?: string;
}

/** One lead card — status select, convert-to-student and delete actions. */
export function LeadCard({ lead }: { lead: Lead }) {
  const update = useUpdateLead();
  const remove = useDeleteLead();
  const convert = useConvertLead();
  const [convertUi, setConvertUi] = useState<ConvertUiState | null>(null);

  const onStatusChange = (status: LeadStatus) => {
    update.mutate({ id: lead.id, input: { status } });
  };

  const onDelete = () => {
    if (window.confirm(`"${lead.fullName}" lidini o'chirilsinmi?`)) remove.mutate(lead.id);
  };

  const onConvert = async () => {
    setConvertUi(null);
    try {
      const res = await convert.mutateAsync(lead.id);
      setConvertUi({
        kind: 'success',
        message: "O'quvchilar ro'yxatiga qo'shildi.",
        studentId: res.student.id,
      });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        const data = err.response.data as { message?: string; studentId?: string };
        if (data.studentId) {
          setConvertUi({
            kind: 'duplicate',
            message: "Bu raqamli o'quvchi bor",
            studentId: data.studentId,
          });
        } else {
          setConvertUi({ kind: 'error', message: data.message ?? "Bu lid allaqachon o'quvchi bo'lgan." });
        }
      } else {
        setConvertUi({ kind: 'error', message: "Xatolik yuz berdi. Qayta urinib ko'ring." });
      }
    }
  };

  const meta = LEAD_STATUS_META[lead.status];
  const converted = lead.status === 'CONVERTED';

  return (
    <NmCard className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[14.5px] font-extrabold tracking-[-0.2px] text-foreground">
            {lead.fullName}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-muted">
            <Phone className="size-3.5 shrink-0" />
            <span className="truncate">{lead.phone}</span>
          </p>
        </div>
        <Can permission="student.delete">
          <NmIconButton tone="danger" onClick={onDelete} disabled={remove.isPending} aria-label="O'chirish">
            <Trash2 className="size-4" />
          </NmIconButton>
        </Can>
      </div>

      {lead.source ? (
        <p className="text-[12px] font-semibold text-muted">Qayerdan: {lead.source}</p>
      ) : null}
      {lead.note ? (
        <p className="line-clamp-2 text-[12.5px] font-medium text-muted">{lead.note}</p>
      ) : null}

      {converted ? (
        <StatusPill tone={meta.tone} label={meta.label} className="self-start" />
      ) : (
        <Can permission="student.update" fallback={<StatusPill tone={meta.tone} label={meta.label} className="self-start" />}>
          <NmSelect
            className="h-[42px] text-[13px]"
            value={lead.status}
            disabled={update.isPending}
            onChange={(e) => onStatusChange(e.target.value as LeadStatus)}
            aria-label="Holatini o'zgartirish"
          >
            {SELECTABLE.map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS_META[s].label}
              </option>
            ))}
          </NmSelect>
        </Can>
      )}

      {!converted && convertUi?.kind !== 'success' ? (
        <Can permission="student.create">
          <NmButton variant="soft" size="sm" onClick={onConvert} disabled={convert.isPending}>
            <UserCheck className="size-4" />
            {convert.isPending ? '...' : "O'quvchiga aylantirish"}
          </NmButton>
        </Can>
      ) : null}

      {convertUi ? (
        <p
          className={
            convertUi.kind === 'success'
              ? 'text-[12.5px] font-semibold text-success'
              : 'text-[12.5px] font-semibold text-danger'
          }
        >
          {convertUi.message}
          {convertUi.studentId ? (
            <>
              {' — '}
              <Link href={`/students/${convertUi.studentId}`} className="font-bold underline">
                ochish
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
    </NmCard>
  );
}
