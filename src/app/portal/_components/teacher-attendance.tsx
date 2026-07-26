"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { NmCard } from "@/components/ui/nm-card";
import { NmButton } from "@/components/ui/nm-button";
import { NmDialog } from "@/components/ui/nm-dialog";
import { HomeSkeleton } from "@/components/ui/nm-skeleton";
import { apiFetch, todayIso, type FailKind } from "../_lib/api";
import { PortalErrorCard } from "./offline-bar";
import { TeacherRoster } from "./teacher-roster";

interface Grp { id: string; name: string; teacherName?: string; subjectName?: string }

/**
 * Teacher attendance inside the Telegram mini app and at /portal.
 *
 * The installable teacher app lives at /t (today's lessons first); this screen
 * stays because the Telegram flow enters here. Only a real 401 ends a session:
 * a teacher standing in a corridor with no signal must not be signed out of the
 * app they mark attendance in.
 */
export function TeacherAttendance({ token, fullName, onLogout }: { token: string; fullName: string; onLogout: (reason?: "auth") => void }) {
  const [groups, setGroups] = useState<Grp[] | null>(null);
  const [fail, setFail] = useState<Exclude<FailKind, "auth"> | null>(null);
  const [reload, setReload] = useState(0);
  const [sel, setSel] = useState<Grp | null>(null);
  const [confirmOut, setConfirmOut] = useState(false);

  useEffect(() => {
    let alive = true;
    setFail(null);
    apiFetch<{ items?: Grp[] } | Grp[]>("/groups?limit=100", { token }).then((res) => {
      if (!alive) return;
      if (res.ok) {
        const d = res.data as { items?: Grp[] } & Grp[];
        setGroups(d.items ?? d);
        return;
      }
      if (res.kind === "auth") { onLogout("auth"); return; }
      setFail(res.kind);
    });
    return () => { alive = false; };
  }, [token, reload, onLogout]);

  const shell = (body: React.ReactNode) => (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">{body}</div>
    </main>
  );

  if (fail && !groups) return shell(<PortalErrorCard kind={fail} onRetry={() => { setFail(null); setReload((x) => x + 1); }} />);
  if (!groups) return shell(<HomeSkeleton />);
  // Always with today's date: asking by groupId alone hands back the group's
  // most recent lesson, which can be weeks old, and the teacher would overwrite
  // a day that was already saved.
  if (sel)
    return shell(
      <TeacherRoster token={token} groupId={sel.id} groupName={sel.name} date={todayIso()} onBack={() => setSel(null)} />,
    );

  // No "Barcha guruhlar" escape hatch any more: the backend now refuses a
  // sheet or a mark for someone else's group with a 403, so the button could
  // only ever lead to a dead end. Directors and admins have no teacher record,
  // so the name match finds nothing and they still see the whole centre.
  const mine = groups.filter((g) => g.teacherName && g.teacherName === fullName);
  const list = mine.length === 0 ? groups : mine;

  return shell(
    <div className="flex flex-col gap-3 sm:gap-5">
      <NmCard className="flex items-center justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <div className="truncate text-[17px] font-extrabold text-foreground">{fullName || "O'qituvchi"}</div>
          <div className="text-[12.5px] font-semibold text-muted">O&apos;qituvchi — davomat</div>
        </div>
        <NmButton variant="soft" size="sm" className="min-h-[44px] min-w-[44px] px-0" aria-label="Chiqish" onClick={() => setConfirmOut(true)}>
          <LogOut className="size-4" />
        </NmButton>
      </NmCard>

      <NmCard className="p-4 sm:p-5">
        <div className="mb-3 text-[13.5px] font-extrabold text-foreground">Davomat — guruhni tanlang</div>
        <div className="flex flex-col gap-2">
          {list.length === 0 ? (
            <p className="text-[13px] font-semibold leading-[1.55] text-muted">
              Sizga guruh biriktirilmagan. Administratorga murojaat qiling.
            </p>
          ) : list.map((g) => (
            <button key={g.id} type="button" onClick={() => setSel(g)}
              className="flex min-h-[44px] items-center justify-between gap-2 rounded-[12px] bg-background px-4 py-3 text-left shadow-nm-sm transition-shadow hover:shadow-nm-inset-sm">
              <span className="truncate text-[14px] font-bold text-foreground">{g.name}</span>
              <span className="shrink-0 text-[12px] font-semibold text-muted">{g.subjectName || "Davomat →"}</span>
            </button>
          ))}
        </div>
      </NmCard>

      <NmDialog open={confirmOut} onOpenChange={setConfirmOut} title="Chiqasizmi?">
        <p className="text-[13.5px] font-semibold leading-[1.55] text-foreground">
          Qayta kirish uchun login va parol kerak bo&apos;ladi.
        </p>
        <div className="mt-4 flex gap-3 max-[380px]:flex-col-reverse">
          <NmButton variant="soft" className="min-h-[44px] flex-[1.4]" autoFocus onClick={() => setConfirmOut(false)}>
            Bekor qilish
          </NmButton>
          <NmButton variant="danger" className="min-h-[44px] flex-1" onClick={() => onLogout()}>
            Chiqish
          </NmButton>
        </div>
      </NmDialog>
    </div>,
  );
}
