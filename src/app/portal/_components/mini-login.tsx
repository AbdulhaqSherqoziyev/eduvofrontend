"use client";

import { useEffect, useRef, useState } from "react";
import { UserCog } from "lucide-react";
import { NmCard } from "@/components/ui/nm-card";
import { NmButton } from "@/components/ui/nm-button";
import { NmInput } from "@/components/ui/nm-input";
import { NmPasswordInput } from "@/components/ui/nm-password-input";
import { FieldLabel } from "@/components/ui/label";
import { LAST_PHONE_KEY, apiFetch, type FailKind } from "../_lib/api";
import { LoginError, LoginHelp, PortalLogin } from "./portal-login";

/** Teacher login (phone + password → tenant token).
 *  Passes Telegram initData so the bot can link this teacher for lesson reminders. */
function TeacherForm({ onLogin, initData, notice }: { onLogin: (token: string, fullName: string) => void; initData?: string; notice?: string }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<FailKind | null>(null);
  const [busy, setBusy] = useState(false);
  const pwRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const last = window.localStorage.getItem(LAST_PHONE_KEY);
      if (last) { setPhone(last); pwRef.current?.focus(); }
    } catch { /* ignore */ }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const value = phone.trim();
    const res = await apiFetch<{ accessToken: string; user?: { fullName?: string } }>("/auth/login", {
      method: "POST",
      body: { phone: value, password, ...(initData ? { initData } : {}) },
    });
    setBusy(false);
    if (!res.ok) { setErr(res.kind); return; }
    if (!res.data?.accessToken) { setErr("auth"); return; }
    try { window.localStorage.setItem(LAST_PHONE_KEY, value); } catch { /* ignore */ }
    onLogin(res.data.accessToken, res.data.user?.fullName ?? "");
  };

  return (
    <NmCard className="w-full max-w-sm p-6 sm:p-7">
      <div className="mb-5 flex flex-col items-center gap-2 text-center">
        <div className="flex size-14 items-center justify-center rounded-[18px] bg-background text-primary shadow-nm-sm">
          <UserCog className="size-7" />
        </div>
        <h1 className="text-[19px] font-extrabold text-foreground">Eduvo — O&apos;qituvchi</h1>
        <p className="text-[12.5px] font-medium text-muted">Telefon va parol bilan kiring — davomat uchun</p>
      </div>
      {notice ? <p className="mb-4 text-center text-[12.5px] font-semibold text-muted">{notice}</p> : null}
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <FieldLabel htmlFor="t-phone">TELEFON</FieldLabel>
          <NmInput id="t-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" autoCapitalize="none" inputMode="tel" autoComplete="username" />
        </div>
        <div>
          <FieldLabel htmlFor="t-pw">PAROL</FieldLabel>
          <NmPasswordInput id="t-pw" ref={pwRef} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        {err ? <LoginError kind={err} /> : null}
        <NmButton type="submit" className="min-h-[46px]" disabled={busy}>{busy ? "Kirilmoqda..." : "Kirish"}</NmButton>
      </form>
      <LoginHelp />
    </NmCard>
  );
}

/**
 * Login gate. `defaultTab` follows the address the person opened: /t is the
 * teacher's app, /portal is the family's. It used to open on "O'qituvchi"
 * everywhere, so every parent started one tap behind on the wrong form.
 */
export function MiniLogin({ onTeacher, onPortal, initData, defaultTab = "teacher", notice }: {
  onTeacher: (token: string, fullName: string) => void;
  onPortal: (token: string) => void;
  initData?: string;
  defaultTab?: "teacher" | "portal";
  notice?: string;
}) {
  const [tab, setTab] = useState<"teacher" | "portal">(defaultTab);
  const tabCls = (a: boolean) =>
    `min-h-[44px] flex-1 rounded-ctl px-3 text-[12.5px] font-bold transition-all ${a ? "text-primary shadow-nm-inset-sm" : "text-muted"}`;

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center gap-4">
      <div className="flex w-full max-w-sm gap-1 rounded-ctl bg-background p-1 shadow-nm-sm">
        <button type="button" className={tabCls(tab === "teacher")} onClick={() => setTab("teacher")}>👨‍🏫 O&apos;qituvchi</button>
        <button type="button" className={tabCls(tab === "portal")} onClick={() => setTab("portal")}>🎓 O&apos;quvchi / Ota-ona</button>
      </div>
      {tab === "teacher"
        ? <TeacherForm onLogin={onTeacher} initData={initData} notice={notice} />
        : <PortalLogin onLogin={onPortal} initData={initData} notice={notice} bare />}
    </div>
  );
}
