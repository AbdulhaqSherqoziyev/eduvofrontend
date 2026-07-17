"use client";

import { Eye, Trash2 } from "lucide-react";
import { startImpersonation } from "@/lib/auth/impersonation";
import { impersonateApi } from "@/lib/api/impersonate";
import { Avatar } from "@/components/ui/avatar";
import { RowIndex } from "@/components/shared/row-index";
import { Can } from "@/components/shared/can";
import { StatusPill } from "@/components/shared/status-pill";
import { NmIconButton } from "@/components/ui/nm-icon-button";
import { cn } from "@/lib/utils/cn";
import { useDeleteTeacher } from "@/lib/hooks/use-teachers";
import { TEACHER_STATUS_META, type Teacher } from "@/lib/types/teacher";
import { EditTeacherDialog } from "./edit-teacher-dialog";
import { TeacherAccountDialog } from "./teacher-account-dialog";

const COLS = "grid min-w-[720px] grid-cols-[40px_2.2fr_1.5fr_1.6fr_0.8fr_1fr_92px] items-center gap-4";

/** One teacher table row (avatar, directions, group chips, rating, status). */
export function TeacherRow({ teacher, n }: { teacher: Teacher; n: number }) {
  const meta = TEACHER_STATUS_META[teacher.status];
  const remove = useDeleteTeacher();

  const onDelete = () => {
    if (window.confirm(`${teacher.fullName} — o'chirilsinmi?`)) remove.mutate(teacher.id);
  };
  const onEnter = async () => {
    try { startImpersonation(await impersonateApi.teacher(teacher.id)); }
    catch (e) {
      const m = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      window.alert(m ?? "O'qituvchi hisobiga kirib bo'lmadi");
    }
  };

  return (
    <div className={cn(COLS, "rounded-[16px] px-4 py-[13px] transition-shadow hover:shadow-nm-inset-sm")}>
      <RowIndex n={n} />
      <div className="flex min-w-0 items-center gap-[13px]">
        <Avatar name={teacher.fullName} size={42} />
        <div className="min-w-0">
          <div className="truncate text-[14px] font-bold text-foreground">{teacher.fullName}</div>
          <div className="text-[12px] font-semibold text-[#9aa6b8]">{teacher.phone}</div>
        </div>
      </div>
      <div className="truncate text-[12.5px] font-semibold text-muted">{teacher.directions || "—"}</div>
      <div className="flex flex-wrap gap-1.5">
        {teacher.groups.length === 0 ? (
          <span className="text-[12.5px] font-semibold text-[#9aa6b8]">Guruh yo‘q</span>
        ) : (
          teacher.groups.map((g) => (
            <span key={g.id} className="rounded-[8px] bg-background px-2 py-1 text-[11.5px] font-bold text-[#5b6b82] shadow-nm-sm">
              {g.name}
            </span>
          ))
        )}
      </div>
      <div className="text-[14px] font-bold text-primary">{teacher.rating}%</div>
      <div>
        <StatusPill label={meta.label} tone={meta.tone} />
      </div>
      <div className="flex justify-end gap-2">
        <Can permission="user.update">
          <NmIconButton aria-label="Hisobiga kirish" onClick={onEnter}>
            <Eye className="size-[15px]" strokeWidth={2} />
          </NmIconButton>
        </Can>
        <Can permission="teacher.update">
          <TeacherAccountDialog teacher={teacher} />
        </Can>
        <Can permission="teacher.update">
          <EditTeacherDialog teacher={teacher} />
        </Can>
        <Can permission="teacher.delete">
          <NmIconButton tone="danger" aria-label="O'chirish" onClick={onDelete} disabled={remove.isPending}>
            <Trash2 className="size-[15px]" strokeWidth={2} />
          </NmIconButton>
        </Can>
      </div>
    </div>
  );
}
