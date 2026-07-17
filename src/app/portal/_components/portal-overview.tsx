"use client";

import { useEffect, useState } from "react";
import { LogOut, Star, Bell, Check } from "lucide-react";
import { NmCard } from "@/components/ui/nm-card";
import { NmButton } from "@/components/ui/nm-button";
import { NmInput } from "@/components/ui/nm-input";
import { formatSom } from "@/lib/utils/format";
import { PortalAssignment, type AssignmentRow } from "./portal-assignment";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface Invoice { period: string; amount: number; paidAmount: number; dueDate: string; status: string }
interface PaymentRow { date: string; amount: number; method: string; note: string; period: string }
interface Overview {
  role: string;
  student: { fullName: string; phone: string; gender: string | null; birthYear: number | null };
  groups: { id: string; name: string; teacherName: string; schedule: string; time: string; room: string }[];
  lessons: { date: string; time: string; group: string; room: string }[];
  attendance: { rate: number; list: { date: string; group: string; status: string; lateMinutes: number }[] };
  assignments: AssignmentRow[];
  finance: { balance: number; invoices: Invoice[]; payments: PaymentRow[] };
  children: { studentId: string; fullName: string }[];
  notifications: { id: string; type: string; title: string; body: string; date: string; read: boolean }[];
  unreadCount: number;
  rating: number;
}

const ST: Record<string, string> = { PRESENT: "Keldi", LATE: "Kech", ABSENT: "Kelmadi", EXCUSED: "Sababli" };
const INV_ST: Record<string, string> = { PAID: "To'langan", PARTIAL: "Qisman", UNPAID: "To'lanmagan", OVERDUE: "Muddati o'tgan" };
const PM: Record<string, string> = { CASH: "Naqd", CLICK: "Click", PAYME: "Payme" };

export function PortalOverview({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [data, setData] = useState<Overview | null>(null);
  const [err, setErr] = useState("");
  const [sel, setSel] = useState<string | undefined>(undefined);
  const [reload, setReload] = useState(0);
  const [pw, setPw] = useState({ cur: "", nw: "" });
  const [pwMsg, setPwMsg] = useState("");

  useEffect(() => {
    const q = sel ? `?studentId=${encodeURIComponent(sel)}` : "";
    fetch(`${API}/portal/overview${q}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => { if (!r.ok) throw new Error("Sessiya tugadi"); return r.json(); })
      .then(setData)
      .catch((e) => setErr(e.message));
  }, [token, sel, reload]);

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg("");
    try {
      const r = await fetch(`${API}/portal/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pw.cur, newPassword: pw.nw }),
      });
      if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(Array.isArray(d.message) ? d.message.join(", ") : d.message || "Xato"); }
      setPw({ cur: "", nw: "" }); setPwMsg("ok");
    } catch (err) { setPwMsg(err instanceof Error ? err.message : "Xato"); }
  };

  const markRead = async () => {
    const q = sel ? `?studentId=${encodeURIComponent(sel)}` : "";
    try { await fetch(`${API}/portal/notifications/read${q}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }); } catch { /* best-effort */ }
    setReload((x) => x + 1);
  };

  if (err) return <NmCard className="p-6 text-center"><p className="text-danger">{err}</p><NmButton className="mt-3" onClick={onLogout}>Chiqish</NmButton></NmCard>;
  if (!data) return <p className="py-10 text-center text-muted">Yuklanmoqda...</p>;

  const fin = data.finance ?? { balance: 0, invoices: [], payments: [] };
  const debt = fin.balance < 0;

  return (
    <div className="flex flex-col gap-5">
      <NmCard className="flex items-center justify-between p-5">
        <div>
          <div className="text-[18px] font-extrabold text-foreground">{data.student.fullName}</div>
          <div className="text-[12.5px] font-semibold text-muted">{data.role === "parent" ? "Ota-ona kabineti" : "O'quvchi kabineti"}</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 rounded-ctl bg-background px-3 py-2 shadow-nm-inset-sm">
            <Star className="size-4 text-warning" />
            <span className="text-[15px] font-extrabold text-foreground">{data.rating}%</span>
          </div>
          <NmButton variant="soft" size="sm" onClick={onLogout}><LogOut className="size-4" /></NmButton>
        </div>
      </NmCard>

      {data.role === "parent" && data.children && data.children.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {data.children.map((c) => {
            const active = (sel ?? data.children[0]?.studentId) === c.studentId;
            return (
              <button key={c.studentId} onClick={() => setSel(c.studentId)}
                className={`rounded-ctl px-4 py-2 text-[13px] font-bold transition-all ${active ? "text-primary shadow-nm-inset" : "text-muted shadow-nm-sm hover:text-primary"}`}>
                {c.fullName}
              </button>
            );
          })}
        </div>
      ) : null}

      {data.notifications?.length ? (
        <NmCard className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] font-extrabold text-foreground">
              <Bell className="size-4 text-primary" />Bildirishnomalar
              {data.unreadCount ? <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">{data.unreadCount}</span> : null}
            </div>
            {data.unreadCount ? (
              <button onClick={markRead} className="inline-flex items-center gap-1 rounded-ctl bg-background px-3 py-1.5 text-[11.5px] font-bold text-primary shadow-nm-sm hover:shadow-nm-inset-sm">
                <Check className="size-3.5" />O&apos;qildi
              </button>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            {data.notifications.slice(0, 12).map((n) => (
              <div key={n.id} className={`rounded-[12px] px-3 py-2 text-[12.5px] shadow-nm-inset-sm ${n.read ? "bg-background" : "bg-background ring-1 ring-primary/30"}`}>
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-foreground">{n.title}</span>
                  <span className="text-[11px] text-muted">{n.date}</span>
                </div>
                {n.body ? <p className="mt-0.5 text-muted">{n.body}</p> : null}
              </div>
            ))}
          </div>
        </NmCard>
      ) : null}

      <NmCard className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[13px] font-extrabold text-foreground">Hisob-kitob</div>
          <div className={`rounded-ctl bg-background px-3 py-1.5 text-[14px] font-extrabold shadow-nm-inset-sm ${fin.balance === 0 ? "text-muted" : debt ? "text-danger" : "text-success"}`}>
            {fin.balance === 0 ? "0 so'm" : debt ? `Qarz: ${formatSom(-fin.balance)} so'm` : `Haqdor: ${formatSom(fin.balance)} so'm`}
          </div>
        </div>
        {fin.invoices.length ? (
          <div className="mb-3 flex flex-col gap-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wide text-muted">To&apos;lov hisoblari</div>
            {fin.invoices.map((iv, i) => (
              <div key={i} className="flex flex-wrap justify-between gap-2 rounded-[12px] bg-background px-3 py-2 text-[12.5px] shadow-nm-inset-sm">
                <span className="font-bold text-foreground">{iv.period}</span>
                <span className="text-muted">{formatSom(iv.paidAmount)} / {formatSom(iv.amount)} so&apos;m · {iv.dueDate}</span>
                <span className={iv.status === "PAID" ? "font-bold text-success" : iv.status === "OVERDUE" ? "font-bold text-danger" : "font-bold text-warning"}>{INV_ST[iv.status] ?? iv.status}</span>
              </div>
            ))}
          </div>
        ) : null}
        {fin.payments.length ? (
          <div className="flex flex-col gap-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wide text-muted">To&apos;lovlar tarixi</div>
            {fin.payments.map((p, i) => (
              <div key={i} className="flex justify-between text-[12.5px]">
                <span className="text-muted">{p.date} · {PM[p.method] ?? p.method}{p.note ? ` · ${p.note}` : ""}</span>
                <span className="font-bold text-success">+{formatSom(p.amount)} so&apos;m</span>
              </div>
            ))}
          </div>
        ) : null}
        {!fin.invoices.length && !fin.payments.length ? <p className="text-[13px] text-muted">To&apos;lov ma&apos;lumoti yo&apos;q</p> : null}
      </NmCard>

      <NmCard className="p-5">
        <div className="mb-2 text-[13px] font-extrabold text-foreground">Guruhlar</div>
        {data.groups.length === 0 ? <p className="text-[13px] text-muted">Guruh yo&apos;q</p> : (
          <div className="flex flex-col gap-2">
            {data.groups.map((g) => (
              <div key={g.id} className="flex flex-wrap justify-between gap-2 rounded-[12px] bg-background px-3 py-2 text-[13px] shadow-nm-inset-sm">
                <span className="font-bold text-foreground">{g.name}</span>
                <span className="text-muted">{g.teacherName} · {g.schedule} {g.time} {g.room ? `· ${g.room}` : ""}</span>
              </div>
            ))}
          </div>
        )}
      </NmCard>

      {data.lessons?.length ? (
        <NmCard className="p-5">
          <div className="mb-2 text-[13px] font-extrabold text-foreground">Kelgusi darslar</div>
          <div className="flex flex-col gap-1.5">
            {data.lessons.map((l, i) => (
              <div key={i} className="flex flex-wrap justify-between gap-2 rounded-[12px] bg-background px-3 py-2 text-[12.5px] shadow-nm-inset-sm">
                <span className="font-bold text-foreground">{l.date} · {l.time}</span>
                <span className="text-muted">{l.group}{l.room ? ` · ${l.room}` : ""}</span>
              </div>
            ))}
          </div>
        </NmCard>
      ) : null}

      <NmCard className="p-5">
        <div className="mb-2 text-[13px] font-extrabold text-foreground">Davomat — {data.attendance.rate}%</div>
        <div className="flex flex-col gap-1.5">
          {data.attendance.list.slice(0, 10).map((a, i) => (
            <div key={i} className="flex justify-between text-[12.5px]">
              <span className="text-muted">{a.date} · {a.group}</span>
              <span className="font-bold text-foreground">{ST[a.status] ?? a.status}{a.lateMinutes ? ` +${a.lateMinutes}'` : ""}</span>
            </div>
          ))}
          {data.attendance.list.length === 0 ? <p className="text-[13px] text-muted">Ma&apos;lumot yo&apos;q</p> : null}
        </div>
      </NmCard>

      <NmCard className="p-5">
        <div className="mb-2 text-[13px] font-extrabold text-foreground">Uy vazifalari</div>
        <div className="flex flex-col gap-2.5">
          {data.assignments.slice(0, 12).map((a, i) => (
            <PortalAssignment key={a.id || i} a={a} role={data.role} token={token} onDone={() => setReload((x) => x + 1)} />
          ))}
          {data.assignments.length === 0 ? <p className="text-[13px] text-muted">Vazifa yo&apos;q</p> : null}
        </div>
      </NmCard>

      <NmCard className="p-5">
        <div className="mb-3 text-[13px] font-extrabold text-foreground">Parolni o&apos;zgartirish</div>
        <form onSubmit={changePw} className="flex flex-col gap-3">
          <NmInput type="password" placeholder="Joriy parol" value={pw.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} />
          <NmInput type="password" placeholder="Yangi parol (kamida 4 belgi)" value={pw.nw} onChange={(e) => setPw({ ...pw, nw: e.target.value })} />
          <div className="flex items-center gap-3">
            <NmButton type="submit" size="sm">Saqlash</NmButton>
            {pwMsg === "ok" ? <span className="text-[12px] font-bold text-success">Saqlandi ✓</span> : pwMsg ? <span className="text-[12px] font-bold text-danger">{pwMsg}</span> : null}
          </div>
        </form>
      </NmCard>
    </div>
  );
}
