"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { NmCard } from "@/components/ui/nm-card";
import { NmButton } from "@/components/ui/nm-button";
import { NmInput } from "@/components/ui/nm-input";
import { FieldLabel } from "@/components/ui/label";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/** Student / parent login using the issued login + password. */
export function PortalLogin({ onLogin, initData, bare }: { onLogin: (token: string) => void; initData?: string; bare?: boolean }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const r = await fetch(`${API}/portal/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: login.trim(), password, ...(initData ? { initData } : {}) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(Array.isArray(d.message) ? d.message.join(", ") : d.message || "Xato");
      onLogin(d.accessToken);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xatolik");
    } finally { setBusy(false); }
  };

  const card = (
    <NmCard className="w-full max-w-sm p-7">
      <div className="mb-5 flex flex-col items-center gap-2 text-center">
        <div className="flex size-14 items-center justify-center rounded-[18px] bg-background text-primary shadow-nm-sm">
          <GraduationCap className="size-7" />
        </div>
        <h1 className="text-[19px] font-extrabold text-foreground">Eduvo — O&apos;quvchi / Ota-ona</h1>
        <p className="text-[12.5px] font-medium text-muted">O&apos;quv markazi bergan login va parol bilan kiring</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <FieldLabel>LOGIN</FieldLabel>
          <NmInput value={login} onChange={(e) => setLogin(e.target.value)} placeholder="o123 yoki v123" autoCapitalize="none" />
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
  if (bare) return card;
  return <div className="flex min-h-[70vh] items-center justify-center">{card}</div>;
}
