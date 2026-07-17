"use client";

import { useState } from "react";
import { UserCog } from "lucide-react";
import { NmCard } from "@/components/ui/nm-card";
import { NmButton } from "@/components/ui/nm-button";
import { NmInput } from "@/components/ui/nm-input";
import { FieldLabel } from "@/components/ui/label";
import { PortalLogin } from "./portal-login";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/** Teacher login (phone + password → tenant token) for the Mini App attendance mode.
 *  Passes Telegram initData so the bot can link this teacher for lesson reminders. */
function TeacherForm({ onLogin, initData }: { onLogin: (token: string, fullName: string) => void; initData?: string }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const r = await fetch(`${API}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), password, ...(initData ? { initData } : {}) }),
      });
      const d = await r.json();
      if (!r.ok || !d.accessToken) throw new Error(Array.isArray(d.message) ? d.message.join(", ") : d.message || "Login yoki parol xato");
      onLogin(d.accessToken, d.user?.fullName ?? "");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xatolik");
    } finally { setBusy(false); }
  };

  return (
    <NmCard className="w-full max-w-sm p-7">
      <div className="mb-5 flex flex-col items-center gap-2 text-center">
        <div className="flex size-14 items-center justify-center rounded-[18px] bg-background text-primary shadow-nm-sm">
          <UserCog className="size-7" />
        </div>
        <h1 className="text-[19px] font-extrabold text-foreground">Eduvo — O&apos;qituvchi</h1>
        <p className="text-[12.5px] font-medium text-muted">Telefon va parol bilan kiring — davomat uchun</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <FieldLabel>TELEFON</FieldLabel>
          <NmInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" autoCapitalize="none" />
        </div>
        <div>
          <FieldLabel>PAROL</FieldLabel>
          <NmInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {err ? <p className="text-[12px] font-semibold text-danger">{err}</p> : null}
        <NmButton type="submit" disabled={busy}>{busy ? "..." : "Kirish"}</NmButton>
      </form>
    </NmCard>
  );
}

/** Mini App login gate: pick role (teacher = attendance, student/parent = kabinet). */
export function MiniLogin({ onTeacher, onPortal, initData }: {
  onTeacher: (token: string, fullName: string) => void;
  onPortal: (token: string) => void;
  initData?: string;
}) {
  const [tab, setTab] = useState<"teacher" | "portal">("teacher");
  const tabCls = (a: boolean) =>
    `flex-1 rounded-ctl px-3 py-2.5 text-[12.5px] font-bold transition-all ${a ? "text-primary shadow-nm-inset-sm" : "text-muted"}`;

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center gap-4">
      <div className="flex w-full max-w-sm gap-1 rounded-ctl bg-background p-1 shadow-nm-sm">
        <button type="button" className={tabCls(tab === "teacher")} onClick={() => setTab("teacher")}>👨‍🏫 O&apos;qituvchi</button>
        <button type="button" className={tabCls(tab === "portal")} onClick={() => setTab("portal")}>🎓 O&apos;quvchi / Ota-ona</button>
      </div>
      {tab === "teacher" ? <TeacherForm onLogin={onTeacher} initData={initData} /> : <PortalLogin onLogin={onPortal} initData={initData} bare />}
    </div>
  );
}
