"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { NmCard } from "@/components/ui/nm-card";
import { NmButton } from "@/components/ui/nm-button";
import { TeacherRoster } from "./teacher-roster";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
interface Grp { id: string; name: string; teacherName?: string; subjectName?: string }

/** Teacher Mini App: pick one of your groups → mark today's attendance. */
export function TeacherAttendance({ token, fullName, onLogout }: { token: string; fullName: string; onLogout: () => void }) {
  const [groups, setGroups] = useState<Grp[] | null>(null);
  const [err, setErr] = useState("");
  const [sel, setSel] = useState<Grp | null>(null);
  const [all, setAll] = useState(false);

  useEffect(() => {
    fetch(`${API}/groups?limit=100`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Sessiya tugadi — qayta kiring"))))
      .then((d) => setGroups(d.items ?? d))
      .catch((e) => setErr(e.message));
  }, [token]);

  if (err) return <NmCard className="p-6 text-center"><p className="text-danger">{err}</p><NmButton className="mt-3" onClick={onLogout}>Chiqish</NmButton></NmCard>;
  if (!groups) return <p className="py-10 text-center text-muted">Yuklanmoqda...</p>;
  if (sel) return <TeacherRoster token={token} groupId={sel.id} groupName={sel.name} onBack={() => setSel(null)} />;

  const mine = groups.filter((g) => g.teacherName && g.teacherName === fullName);
  const list = all || mine.length === 0 ? groups : mine;

  return (
    <div className="flex flex-col gap-5">
      <NmCard className="flex items-center justify-between p-5">
        <div>
          <div className="text-[18px] font-extrabold text-foreground">{fullName || "O'qituvchi"}</div>
          <div className="text-[12.5px] font-semibold text-muted">O&apos;qituvchi — davomat</div>
        </div>
        <NmButton variant="soft" size="sm" onClick={onLogout}><LogOut className="size-4" /></NmButton>
      </NmCard>
      <NmCard className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[13px] font-extrabold text-foreground">Davomat — guruhni tanlang</div>
          {mine.length > 0 ? (
            <button type="button" onClick={() => setAll((v) => !v)} className="text-[11.5px] font-bold text-primary">
              {all ? "Mening guruhlarim" : "Barcha guruhlar"}
            </button>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          {list.length === 0 ? <p className="text-[13px] text-muted">Guruh yo&apos;q</p> : list.map((g) => (
            <button key={g.id} type="button" onClick={() => setSel(g)}
              className="flex items-center justify-between rounded-[12px] bg-background px-4 py-3 text-left shadow-nm-sm transition-shadow hover:shadow-nm-inset-sm">
              <span className="text-[14px] font-bold text-foreground">{g.name}</span>
              <span className="text-[12px] font-semibold text-muted">{g.subjectName || "Davomat →"}</span>
            </button>
          ))}
        </div>
      </NmCard>
    </div>
  );
}
