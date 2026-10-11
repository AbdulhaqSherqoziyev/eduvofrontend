"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { NmCard } from "@/components/ui/nm-card";
import { NmButton } from "@/components/ui/nm-button";
import { NmInput } from "@/components/ui/nm-input";
import { RowsSkeleton } from "@/components/ui/nm-skeleton";
import { apiFetch, clearPending, dayLabel, readPending, writePending, type FailKind } from "../_lib/api";
import { PortalErrorCard } from "./offline-bar";

type Status = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";
interface Mark { studentId: string; fullName: string; status: Status; lateMinutes: number; score?: number | null; scoreMax?: number | null }
interface Sheet { lesson: { id: string; startTime: string; date: string }; marks: Mark[]; scoreMax?: number | null }

/** A score only makes sense for someone who was in the room. */
const scorable = (s: Status) => s === "PRESENT" || s === "LATE";
/** Up to ten → one tap per number; a longer scale gets a number field. */
const CHIPS_UP_TO = 10;

// Three explicit choices per student (no cycling) — the picked one fills with its colour.
const OPTS: { status: Status; label: string; emoji: string; color: string }[] = [
  { status: "PRESENT", label: "Keldi", emoji: "✅", color: "#2BB673" },
  { status: "LATE", label: "Kech", emoji: "🕐", color: "#E8A13A" },
  { status: "ABSENT", label: "Yo'q", emoji: "❌", color: "#E4574C" },
];

type SaveState =
  | { k: "idle" }
  | { k: "saving" }
  | { k: "saved"; present: number; absent: number }
  | { k: "failed"; kind: Exclude<FailKind, "auth"> };

/**
 * One group's roster: pick Keldi / Kech / Yo'q per student, then save.
 *
 * Nobody is marked in advance. Two taps would be cheaper, but a sheet that
 * arrives pre-filled with "Keldi" gets saved unread, and then every student in
 * the centre is present forever. [Hammasi keldi] is still one tap — it is just
 * a decision the teacher makes rather than one made for them.
 */
export function TeacherRoster({ token, groupId, groupName, lessonId, date, onBack }: {
  token: string;
  groupId: string;
  groupName: string;
  /** Known lesson — the exact sheet. */
  lessonId?: string | null;
  /** Required when there is no lessonId: the sheet endpoint opens (or reuses)
   *  the lesson for THIS day. Asking by groupId alone returns the group's most
   *  recent lesson, which measured a month old in practice — the teacher would
   *  have overwritten a saved day without knowing. */
  date?: string;
  onBack: () => void;
}) {
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loadFail, setLoadFail] = useState<Exclude<FailKind, "auth"> | null>(null);
  const [loadMsg, setLoadMsg] = useState<string | null>(null);
  const [save, setSave] = useState<SaveState>({ k: "idle" });
  const [pending, setPending] = useState(false);
  const [reload, setReload] = useState(0);
  const marksRef = useRef<Mark[]>([]);
  marksRef.current = marks;

  const query = lessonId
    ? `?lessonId=${encodeURIComponent(lessonId)}`
    : `?groupId=${encodeURIComponent(groupId)}&date=${encodeURIComponent(date ?? "")}`;

  // The sheet request creates the day's lesson when it is missing, so it must
  // go out exactly once per screen. Strict mode's double effect (and a stray
  // re-render) would otherwise leave an extra empty lesson row behind.
  const sentRef = useRef<string | null>(null);

  useEffect(() => {
    const key = `${query}#${reload}`;
    if (sentRef.current === key) return;
    sentRef.current = key;

    let alive = true;
    setLoadFail(null);
    setLoadMsg(null);
    apiFetch<Sheet>(`/attendance/sheet${query}`, { token }).then((res) => {
      if (!alive) return;
      if (!res.ok) {
        // 4xx here carries copy the backend wrote for the teacher ("Kelasi kun
        // uchun davomat varaqasi ochilmaydi"); anything else gets our own.
        if (res.kind === "server" && res.status && res.status < 500 && res.message) setLoadMsg(res.message);
        setLoadFail(res.kind === "auth" ? "server" : res.kind);
        return;
      }
      setSheet(res.data);
      // Work that never reached the server wins over the server's copy — it is
      // newer, and it is the teacher's.
      const waiting = readPending(res.data.lesson.id);
      if (waiting) {
        const byId = new Map(waiting.marks.map((m) => [m.studentId, m]));
        setMarks(res.data.marks.map((m) => {
          const w = byId.get(m.studentId);
          if (!w) return m;
          // A queue written before scores existed has no `score` — keep the server's.
          return { ...m, status: w.status as Status, lateMinutes: w.lateMinutes, score: w.score === undefined ? m.score : w.score };
        }));
        setPending(true);
      } else {
        setMarks(res.data.marks);
      }
    });
    return () => { alive = false; };
  }, [token, query, reload]);

  // null/0 = the centre does not score lessons: no chips, and `score` stays out
  // of the payload so the request is exactly what it was before.
  const scoreMax = sheet?.scoreMax && sheet.scoreMax > 0 ? sheet.scoreMax : null;

  // Absent drops the score; coming back leaves it empty to be re-entered.
  const setStatus = (id: string, status: Status) => {
    setSave({ k: "idle" });
    setMarks((ms) => ms.map((m) => m.studentId === id
      ? { ...m, status, lateMinutes: status === "LATE" ? (m.lateMinutes || 5) : 0, score: scorable(status) ? (m.score ?? null) : null }
      : m));
  };
  const setScore = (id: string, score: number | null) => {
    setSave({ k: "idle" });
    setMarks((ms) => ms.map((m) => m.studentId === id ? { ...m, score } : m));
  };
  const allPresent = () => {
    setSave({ k: "idle" });
    setMarks((ms) => ms.map((m) => ({ ...m, status: "PRESENT", lateMinutes: 0 })));
  };

  const submit = useCallback(async () => {
    const current = marksRef.current;
    if (!sheet || !current.length) return;
    setSave({ k: "saving" });
    const scored = !!sheet.scoreMax && sheet.scoreMax > 0;
    const payload = current.map((m) => ({
      studentId: m.studentId,
      status: m.status,
      lateMinutes: m.lateMinutes,
      ...(scored ? { score: m.score ?? null } : {}),
    }));
    const res = await apiFetch("/attendance/marks", {
      token,
      method: "POST",
      body: { lessonId: sheet.lesson.id, marks: payload },
    });
    if (res.ok) {
      clearPending(sheet.lesson.id);
      setPending(false);
      const present = current.filter((m) => m.status === "PRESENT" || m.status === "LATE").length;
      setSave({ k: "saved", present, absent: current.length - present });
      return;
    }
    // The marks stay on screen and in storage. Losing a teacher's work because
    // a tunnel ate the request is the one outcome this screen must never have.
    writePending({
      lessonId: sheet.lesson.id,
      groupId,
      groupName,
      at: new Date().toISOString(),
      marks: payload,
    });
    setPending(true);
    setSave({ k: "failed", kind: res.kind === "auth" ? "server" : res.kind });
  }, [sheet, token, groupId, groupName]);

  // Connection back → send it quietly, without asking.
  useEffect(() => {
    if (!pending) return;
    const on = () => { void submit(); };
    window.addEventListener("online", on);
    return () => window.removeEventListener("online", on);
  }, [pending, submit]);

  if (loadFail && !sheet) {
    return (
      <div className="flex flex-col gap-3 sm:gap-5">
        <BackRow onBack={onBack} groupName={groupName} sheet={null} />
        {loadMsg ? (
          <NmCard className="p-6 text-center">
            <p className="text-[13.5px] font-semibold leading-[1.55] text-foreground">{loadMsg}</p>
            <NmButton variant="soft" className="mt-4 min-h-[44px] w-full" onClick={onBack}>
              Orqaga
            </NmButton>
          </NmCard>
        ) : (
          <PortalErrorCard kind={loadFail} onRetry={() => { setLoadFail(null); setReload((x) => x + 1); }} />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-5">
      <BackRow onBack={onBack} groupName={groupName} sheet={sheet} />

      {!sheet ? <RowsSkeleton rows={5} /> : marks.length === 0 ? (
        <NmCard className="p-4 sm:p-5">
          <p className="text-[13px] font-semibold leading-[1.55] text-muted">
            Bu guruhda o&apos;quvchi yo&apos;q. Ro&apos;yxatga o&apos;quvchi qo&apos;shilgach shu yerda ko&apos;rinadi.
          </p>
        </NmCard>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2 px-1">
            <p className="text-[12.5px] font-semibold text-muted">Har bir o&apos;quvchi uchun tanlang:</p>
            <button type="button" onClick={allPresent} className="min-h-[44px] px-1 text-[12.5px] font-bold text-success">
              ✅ Hammasi keldi
            </button>
          </div>

          {marks.map((m) => (
            <NmCard key={m.studentId} className="p-3.5 sm:p-4">
              <div className="mb-2.5 truncate text-[14.5px] font-bold text-foreground">{m.fullName}</div>
              <div className="grid grid-cols-3 gap-2">
                {OPTS.map((o) => {
                  const active = m.status === o.status;
                  return (
                    <button key={o.status} type="button" onClick={() => setStatus(m.studentId, o.status)}
                      className={`min-h-[44px] rounded-[11px] text-[13px] font-extrabold transition-all ${active ? "text-white shadow-nm-inset-sm" : "bg-background text-[#9aa6b8] shadow-nm-sm active:shadow-nm-inset-sm"}`}
                      style={active ? { background: o.color } : undefined}>
                      {o.emoji} {o.label}{active && o.status === "LATE" && m.lateMinutes ? ` +${m.lateMinutes}'` : ""}
                    </button>
                  );
                })}
              </div>
              {scoreMax != null && scorable(m.status) ? (
                <ScoreRow scoreMax={scoreMax} value={m.score ?? null} onChange={(v) => setScore(m.studentId, v)} />
              ) : null}
            </NmCard>
          ))}

          {save.k === "failed" ? (
            <div className="rounded-ctl bg-background px-3 py-2.5 shadow-nm-inset-sm">
              <p className="text-[12.5px] font-semibold leading-[1.55] text-warning">
                {save.kind === "network"
                  ? "Saqlanmadi — internet yo'q. Belgilaganlaringiz turibdi, aloqa tiklanganda «Qayta saqlash»ni bosing."
                  : "Saqlanmadi. Qayta urinib ko'ring."}
              </p>
            </div>
          ) : null}

          {save.k === "saved" ? (
            <p className="text-[13px] font-bold text-success">
              Saqlandi. {save.present} keldi, {save.absent} kelmadi.
            </p>
          ) : null}

          <NmButton className="min-h-[46px]" onClick={submit} disabled={save.k === "saving"}>
            {save.k === "saving" ? "Saqlanmoqda..." : save.k === "failed" || pending ? "Qayta saqlash" : "Saqlash"}
          </NmButton>
        </>
      )}
    </div>
  );
}

/**
 * Lesson score under the status buttons. Scales up to ten are one tap per
 * number — tapping the chosen one again clears it; a longer scale gets a
 * number field that clips at the maximum. Empty = no score.
 */
function ScoreRow({ scoreMax, value, onChange }: { scoreMax: number; value: number | null; onChange: (v: number | null) => void }) {
  const [clipNote, setClipNote] = useState<string | null>(null);

  if (scoreMax <= CHIPS_UP_TO) {
    const nums = Array.from({ length: scoreMax }, (_, i) => i + 1);
    return (
      <div className="mt-2.5">
        <div className="mb-1.5 text-[12px] font-bold text-muted">Baho</div>
        <div className="grid grid-cols-5 gap-2">
          {nums.map((n) => {
            const on = value === n;
            return (
              <button key={n} type="button" aria-pressed={on} aria-label={`Baho ${n}`}
                onClick={() => onChange(on ? null : n)}
                className={`min-h-[44px] rounded-[11px] text-[14.5px] font-extrabold transition-all ${on ? "bg-primary text-white shadow-nm-inset-sm" : "bg-background text-[#9aa6b8] shadow-nm-sm active:shadow-nm-inset-sm"}`}>
                {n}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    if (digits === "") { setClipNote(null); onChange(null); return; }
    const n = Number(digits);
    if (n > scoreMax) { setClipNote(`Eng ko'pi — ${scoreMax}. Siz ${n} yozdingiz.`); onChange(scoreMax); return; }
    setClipNote(null);
    onChange(n);
  };

  return (
    <div className="mt-2.5">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-bold text-muted">Baho</span>
        <NmInput
          inputMode="numeric"
          placeholder="—"
          aria-label="Baho"
          className="h-[44px] w-[84px] rounded-[11px] px-2 text-center text-[14.5px] font-extrabold shadow-nm-inset-sm"
          value={value == null ? "" : String(value)}
          onChange={onInput}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
        />
        <span className="text-[13px] font-bold text-muted">/{scoreMax}</span>
      </div>
      {clipNote && value != null ? <p className="mt-1.5 text-[11.5px] font-semibold text-muted">{clipNote}</p> : null}
    </div>
  );
}

function BackRow({ onBack, groupName, sheet }: { onBack: () => void; groupName: string; sheet: Sheet | null }) {
  return (
    <NmCard className="flex items-center gap-3 p-4">
      <NmButton variant="soft" size="sm" className="min-h-[44px] min-w-[44px] px-0" aria-label="Orqaga" onClick={onBack}>
        <ChevronLeft className="size-4" />
      </NmButton>
      <div className="min-w-0">
        <div className="truncate text-[15px] font-extrabold text-foreground">{groupName}</div>
        <div className="truncate text-[12.5px] font-semibold text-muted">
          {sheet ? `${dayLabel(sheet.lesson.date.slice(0, 10))} · ${sheet.lesson.startTime}` : " "}
        </div>
      </div>
    </NmCard>
  );
}
