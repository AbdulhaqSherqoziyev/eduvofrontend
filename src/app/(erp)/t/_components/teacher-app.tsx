"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarCheck, Check, Users, User, AlertCircle } from "lucide-react";
import { NmCard } from "@/components/ui/nm-card";
import { NmButton } from "@/components/ui/nm-button";
import { NmDialog } from "@/components/ui/nm-dialog";
import { HomeSkeleton, RowsSkeleton } from "@/components/ui/nm-skeleton";
import {
  apiFetch,
  dayLabel,
  listPending,
  longDayLabel,
  readCache,
  todayIso,
  writeCache,
  type FailKind,
  type PendingMarks,
} from "../../portal/_lib/api";
import { OfflineBar, PortalErrorCard } from "../../portal/_components/offline-bar";
import { PortalTabBar, type TabDef } from "../../portal/_components/portal-tabbar";
import { PasswordForm } from "../../portal/_components/portal-profile";
import { TeacherRoster } from "../../portal/_components/teacher-roster";

/** Contract: GET /api/portal/teacher/today — the teacher's OWN lessons, scoped
 *  server-side by `group.teacherId` (never by a name match). */
interface TodayLesson {
  /** null when the group meets today by schedule but no Lesson row exists yet. */
  lessonId: string | null;
  startTime: string;
  endTime: string;
  groupId: string;
  groupName: string;
  room: string;
  studentCount: number;
  marked: boolean;
  present: number;
  absent: number;
}
interface NextLesson {
  date: string;
  startTime: string;
  endTime: string;
  groupId: string;
  groupName: string;
  room: string;
}
interface TodayResponse {
  date: string;
  lessons: TodayLesson[];
  next: NextLesson | null;
}

interface Grp {
  id: string;
  name: string;
  subjectName?: string;
  teacherName?: string;
  schedule?: string;
  startTime?: string;
  endTime?: string;
  roomName?: string;
  studentCount?: number;
}

type Tab = "lessons" | "groups" | "profile";

const TABS: TabDef<Tab>[] = [
  { key: "lessons", label: "Darslarim", icon: CalendarCheck },
  { key: "groups", label: "Guruhlarim", icon: Users },
  { key: "profile", label: "Profil", icon: User },
];

const CARD = "p-4 sm:p-5";
const DASH = "—";
const nowHm = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/**
 * The teacher's home screen: today, in order, with the nearest lesson on top.
 *
 * Deliberately NOT a small ERP — no money, no debtors, no revenue. A teacher
 * opens this between two lessons with one hand; anything that is not "who is in
 * front of me right now" is noise.
 */
export function TeacherApp({
  token,
  fullName,
  onLogout,
  onToken,
}: {
  token: string;
  fullName: string;
  onLogout: (reason?: "auth") => void;
  onToken?: (t: string) => void;
}) {
  const [today, setToday] = useState<TodayResponse | null>(null);
  const [groups, setGroups] = useState<Grp[] | null>(null);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [fail, setFail] = useState<Exclude<FailKind, "auth"> | null>(null);
  const [tab, setTab] = useState<Tab>("lessons");
  const [open, setOpen] = useState<{ groupId: string; groupName: string; lessonId: string | null; date: string } | null>(null);
  const [reload, setReload] = useState(0);
  const [confirmOut, setConfirmOut] = useState(false);
  const [pending, setPending] = useState<PendingMarks[]>([]);

  useEffect(() => setPending(listPending()), [reload, open]);

  useEffect(() => {
    let alive = true;
    const key = `teacher:today:${todayIso()}`;
    const cached = readCache<TodayResponse>(key);
    if (cached) {
      setToday(cached.data);
      setCachedAt(cached.at);
      setFromCache(true);
    }
    setFail(null);

    apiFetch<TodayResponse>("/portal/teacher/today", { token }).then((res) => {
      if (!alive) return;
      if (res.ok && res.data && Array.isArray(res.data.lessons)) {
        setToday(res.data);
        setFromCache(false);
        setFail(null);
        writeCache(key, res.data);
        return;
      }
      if (!res.ok && res.kind === "auth") { onLogout("auth"); return; }
      setFail(!res.ok && res.kind === "network" ? "network" : "server");
    });

    return () => { alive = false; };
  }, [token, reload, onLogout]);

  // The "Guruhlarim" tab still reads the tenant-wide group list, so it stays
  // narrowed to this teacher's own groups on the client. See the handover note:
  // a server-scoped list is the proper fix.
  useEffect(() => {
    let alive = true;
    apiFetch<{ items?: Grp[] } | Grp[]>("/groups?limit=100", { token }).then((res) => {
      if (!alive || !res.ok) return;
      const d = res.data as { items?: Grp[] } & Grp[];
      const all = d.items ?? d ?? [];
      const mine = all.filter((g) => g.teacherName && g.teacherName === fullName);
      setGroups(mine.length ? mine : all);
    });
    return () => { alive = false; };
  }, [token, fullName, reload]);

  useEffect(() => {
    const on = () => setReload((x) => x + 1);
    window.addEventListener("online", on);
    return () => window.removeEventListener("online", on);
  }, []);

  const retry = useCallback(() => { setFail(null); setReload((x) => x + 1); }, []);

  const shell = (body: React.ReactNode, withTabs = true) => (
    <>
      <main className="min-h-screen bg-background p-4 pb-[76px] sm:p-8 sm:pb-[76px]">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:gap-5">{body}</div>
      </main>
      {withTabs ? <PortalTabBar tabs={TABS} active={tab} onChange={setTab} /> : null}
    </>
  );

  if (open) {
    return shell(
      <TeacherRoster
        token={token}
        groupId={open.groupId}
        groupName={open.groupName}
        lessonId={open.lessonId}
        date={open.date}
        onBack={() => setOpen(null)}
      />,
      false,
    );
  }

  if (tab === "profile") {
    return shell(
      <>
        <NmCard className={CARD}>
          <div className="text-[17px] font-extrabold text-foreground">{fullName || "O'qituvchi"}</div>
          <div className="mt-0.5 text-[12.5px] font-semibold text-muted">O&apos;qituvchi</div>
        </NmCard>
        <PasswordForm token={token} path="/auth/change-password" method="POST" min={6} onToken={onToken} />
        <NmButton variant="danger" className="min-h-[44px] w-full" onClick={() => setConfirmOut(true)}>
          Chiqish
        </NmButton>
        <LogoutDialog open={confirmOut} onOpenChange={setConfirmOut} onConfirm={() => onLogout()} />
      </>,
    );
  }

  if (tab === "groups") {
    return shell(
      groups === null ? (
        <RowsSkeleton />
      ) : groups.length === 0 ? (
        <NmCard className={CARD}>
          <p className="text-[13px] font-semibold leading-[1.55] text-muted">
            Sizga guruh biriktirilmagan. Administratorga murojaat qiling.
          </p>
        </NmCard>
      ) : (
        <>
          <div className="px-1 text-[17px] font-extrabold text-foreground">Guruhlarim</div>
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setOpen({ groupId: g.id, groupName: g.name, lessonId: null, date: todayIso() })}
              className="w-full rounded-card bg-surface p-4 text-left shadow-nm sm:p-5"
            >
              <div className="truncate text-[15px] font-extrabold text-foreground">{g.name}</div>
              <div className="mt-1 truncate text-[13px] font-semibold text-muted">
                {[g.schedule, [g.startTime, g.endTime].filter(Boolean).join("–"), g.roomName].filter(Boolean).join(" · ")}
              </div>
              <div className="mt-0.5 text-[12.5px] font-semibold text-muted">
                {g.studentCount != null ? `${g.studentCount} o'quvchi` : ""}
              </div>
            </button>
          ))}
        </>
      ),
    );
  }

  // ── Darslarim ──────────────────────────────────────────────────────────────
  if (!today && fail) return shell(<PortalErrorCard kind={fail} onRetry={retry} />, false);
  if (!today) return shell(<HomeSkeleton />, false);

  const pendingByGroup = new Map(pending.map((p) => [p.groupId, p]));
  const hm = nowHm();
  const list = [...today.lessons].sort((a, b) => {
    const aDone = a.marked || (!!a.endTime && a.endTime < hm);
    const bDone = b.marked || (!!b.endTime && b.endTime < hm);
    if (aDone !== bDone) return aDone ? 1 : -1;
    return a.startTime < b.startTime ? -1 : 1;
  });

  return shell(
    <>
      {fromCache && fail && cachedAt ? <OfflineBar at={cachedAt} kind={fail} /> : null}

      <div className="px-1">
        <div className="text-[13px] font-semibold text-muted">{longDayLabel(today.date || todayIso())}</div>
        <h1 className="mt-0.5 text-[17px] font-extrabold text-foreground">
          {list.length ? `Bugun ${list.length} ta darsingiz bor` : "Bugun darsingiz yo'q"}
        </h1>
      </div>

      {list.length === 0 ? (
        <NmCard className={CARD}>
          <p className="text-[13px] font-semibold leading-[1.55] text-muted">
            {today.next
              ? `Bugun darsingiz yo'q. Keyingi darsingiz: ${dayLabel(today.next.date)}, ${today.next.startTime}.`
              : "Sizga guruh biriktirilmagan. Administratorga murojaat qiling."}
          </p>
        </NmCard>
      ) : (
        list.map((l) => {
          const done = l.marked || (!!l.endTime && l.endTime < hm);
          const waiting = pendingByGroup.get(l.groupId);
          // With no Lesson row yet the sheet is opened by (groupId, date) — the
          // date is what stops it resolving to some lesson from last month and
          // overwriting a day the teacher already saved.
          const openSheet = () =>
            setOpen({ groupId: l.groupId, groupName: l.groupName, lessonId: l.lessonId, date: today.date || todayIso() });
          return (
            <NmCard key={l.lessonId ?? `${l.groupId}-${l.startTime}`} className={`${CARD} ${done && !waiting ? "opacity-70" : ""}`}>
              <div className="truncate text-[15px] font-extrabold text-foreground">
                {l.startTime} · {l.groupName}
              </div>
              <div className="mt-1 truncate text-[13px] font-semibold text-muted">
                {l.room || DASH} · {l.studentCount} o&apos;quvchi
              </div>

              {l.marked && !waiting ? (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[13px] font-bold text-success">
                    <Check className="size-4 shrink-0" />
                    Belgilangan · {l.present} keldi, {l.absent} kelmadi
                  </span>
                  <NmButton variant="soft" className="min-h-[44px]" onClick={openSheet}>
                    O&apos;zgartirish
                  </NmButton>
                </div>
              ) : (
                <>
                  <PendingNote p={waiting} />
                  <NmButton className="mt-3 min-h-[46px] w-full" onClick={openSheet}>
                    {waiting ? "Qayta saqlash" : "Davomat belgilash"}
                  </NmButton>
                </>
              )}
            </NmCard>
          );
        })
      )}
    </>,
  );
}

/** Marks that never reached the server are announced on the lesson itself, so
 *  the teacher finds them where they left them. */
function PendingNote({ p }: { p?: PendingMarks }) {
  if (!p) return null;
  return (
    <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-bold text-warning">
      <AlertCircle className="size-4 shrink-0" />
      Saqlanmagan belgilar bor
    </p>
  );
}

function LogoutDialog({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (v: boolean) => void; onConfirm: () => void }) {
  return (
    <NmDialog open={open} onOpenChange={onOpenChange} title="Chiqasizmi?">
      <p className="text-[13.5px] font-semibold leading-[1.55] text-foreground">
        Qayta kirish uchun login va parol kerak bo&apos;ladi.
      </p>
      <div className="mt-4 flex gap-3 max-[380px]:flex-col-reverse">
        <NmButton variant="soft" className="min-h-[44px] flex-[1.4]" autoFocus onClick={() => onOpenChange(false)}>
          Bekor qilish
        </NmButton>
        <NmButton variant="danger" className="min-h-[44px] flex-1" onClick={onConfirm}>
          Chiqish
        </NmButton>
      </div>
    </NmDialog>
  );
}
