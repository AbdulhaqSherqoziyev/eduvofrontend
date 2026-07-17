"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { NmCard } from "@/components/ui/nm-card";
import { NmButton } from "@/components/ui/nm-button";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
type Status = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";
interface Mark { studentId: string; fullName: string; status: Status; lateMinutes: number }
interface Sheet { lesson: { id: string; startTime: string; date: string }; marks: Mark[] }

// Three explicit choices per student (no cycling) — the picked one fills with its colour.
const OPTS: { status: Status; label: string; emoji: string; color: string }[] = [
  { status: "PRESENT", label: "Keldi", emoji: "✅", color: "#2BB673" },
  { status: "LATE", label: "Kech", emoji: "🕐", color: "#E8A13A" },
  { status: "ABSENT", label: "Yo'q", emoji: "❌", color: "#E4574C" },
];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

/** One group's roster: pick Keldi / Kech / Yo'q per student, then save. */
export function TeacherRoster({ token, groupId, groupName, onBack }: { token: string; groupId: string; groupName: string; onBack: () => void }) {
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API}/attendance/sheet?groupId=${groupId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Yuklab bo'lmadi"))))
      .then((d: Sheet) => { setSheet(d); setMarks(d.marks); })
      .catch((e) => setErr(e.message));
  }, [token, groupId]);

  const setStatus = (id: string, status: Status) => {
    setSaved(false);
    setMarks((ms) => ms.map((m) => m.studentId === id ? { ...m, status, lateMinutes: status === "LATE" ? (m.lateMinutes || 5) : 0 } : m));
  };
  const allPresent = () => { setSaved(false); setMarks((ms) => ms.map((m) => ({ ...m, status: "PRESENT", lateMinutes: 0 }))); };

  const save = async () => {
    if (!sheet) return;
    setBusy(true); setSaved(false); setErr("");
    try {
      const r = await fetch(`${API}/attendance/marks`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lessonId: sheet.lesson.id, marks: marks.map((m) => ({ studentId: m.studentId, status: m.status, lateMinutes: m.lateMinutes })) }),
      });
      if (!r.ok) throw new Error("Saqlashda xatolik");
      setSaved(true);
    } catch (e) { setErr(e instanceof Error ? e.message : "Xato"); } finally { setBusy(false); }
  };

  return (
    <div className="flex flex-col gap-4">
      <NmCard className="flex items-center gap-3 p-4">
        <NmButton variant="soft" size="sm" onClick={onBack}><ChevronLeft className="size-4" /></NmButton>
        <div>
          <div className="text-[15px] font-extrabold text-foreground">{groupName}</div>
          <div className="text-[12px] font-semibold text-muted">{sheet ? `${fmtDate(sheet.lesson.date)} · ${sheet.lesson.startTime}` : "..."}</div>
        </div>
      </NmCard>
      {err ? <p className="text-center text-[13px] font-bold text-danger">{err}</p> : null}
      {!sheet ? <p className="py-8 text-center text-muted">Yuklanmoqda...</p> : (
        <>
          <div className="flex items-center justify-between px-1">
            <p className="text-[12px] font-semibold text-muted">Har bir o&apos;quvchi uchun tanlang:</p>
            {marks.length ? <button type="button" onClick={allPresent} className="text-[12px] font-bold text-success">✅ Hammasi keldi</button> : null}
          </div>
          {marks.length === 0 ? <NmCard className="p-4"><p className="text-[13px] text-muted">O&apos;quvchi yo&apos;q</p></NmCard> : marks.map((m) => (
            <NmCard key={m.studentId} className="p-3.5">
              <div className="mb-2.5 text-[14.5px] font-bold text-foreground">{m.fullName}</div>
              <div className="grid grid-cols-3 gap-2">
                {OPTS.map((o) => {
                  const active = m.status === o.status;
                  return (
                    <button key={o.status} type="button" onClick={() => setStatus(m.studentId, o.status)}
                      className={`rounded-[11px] py-2.5 text-[13px] font-extrabold transition-all ${active ? "text-white shadow-nm-inset-sm" : "bg-background text-[#9aa6b8] shadow-nm-sm active:shadow-nm-inset-sm"}`}
                      style={active ? { background: o.color } : undefined}>
                      {o.emoji} {o.label}{active && o.status === "LATE" && m.lateMinutes ? ` +${m.lateMinutes}'` : ""}
                    </button>
                  );
                })}
              </div>
            </NmCard>
          ))}
          <NmButton onClick={save} disabled={busy || marks.length === 0}>{busy ? "..." : saved ? "Saqlandi ✓" : "💾 Saqlash"}</NmButton>
        </>
      )}
    </div>
  );
}
