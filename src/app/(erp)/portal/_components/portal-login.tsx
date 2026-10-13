"use client";

import { useEffect, useRef, useState } from "react";
import { GraduationCap } from "lucide-react";
import { NmCard } from "@/components/ui/nm-card";
import { NmButton } from "@/components/ui/nm-button";
import { NmInput } from "@/components/ui/nm-input";
import { NmPasswordInput } from "@/components/ui/nm-password-input";
import { FieldLabel } from "@/components/ui/label";
import { LAST_LOGIN_KEY, apiFetch, type FailKind } from "../_lib/api";
import { CENTER_PHONE } from "../_lib/types";

/** The one line that tells a person what to do when the login itself is lost.
 *  They cannot reset it themselves — only the centre can. */
export function LoginHelp() {
  return (
    <p className="mt-4 text-center text-[12px] font-medium leading-[1.6] text-muted">
      Login yoki parolni unutdingizmi? O&apos;quv markazingizga murojaat qiling:{" "}
      <a className="font-bold text-primary" href={`tel:${CENTER_PHONE.replace(/\s/g, "")}`}>
        {CENTER_PHONE}
      </a>
    </p>
  );
}

/** Wrong password is the person's business; a dead connection is not. Only the
 *  first one is red. */
export function loginErrorText(kind: FailKind): string {
  if (kind === "network") return "Internet bilan aloqa yo'q. Ulanishni tekshiring.";
  if (kind === "auth") return "Login yoki parol xato.";
  return "Birozdan keyin qayta urinib ko'ring.";
}

export function LoginError({ kind }: { kind: FailKind }) {
  return (
    <p className={`text-[12.5px] font-semibold ${kind === "auth" ? "text-danger" : "text-muted"}`}>
      {loginErrorText(kind)}
    </p>
  );
}

/** Student / parent login using the issued login + password. */
export function PortalLogin({ onLogin, initData, bare, notice }: { onLogin: (token: string) => void; initData?: string; bare?: boolean; notice?: string }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<FailKind | null>(null);
  const [busy, setBusy] = useState(false);
  const pwRef = useRef<HTMLInputElement>(null);

  // The login was issued by the centre and is not a secret; remembering it
  // halves the typing on a phone. The password never is remembered.
  useEffect(() => {
    try {
      const last = window.localStorage.getItem(LAST_LOGIN_KEY);
      if (last) {
        setLogin(last);
        pwRef.current?.focus();
      }
    } catch {
      /* ignore */
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const value = login.trim();
    const res = await apiFetch<{ accessToken: string }>("/portal/login", {
      method: "POST",
      body: { login: value, password, ...(initData ? { initData } : {}) },
    });
    setBusy(false);
    if (!res.ok) { setErr(res.kind); return; }
    try { window.localStorage.setItem(LAST_LOGIN_KEY, value); } catch { /* ignore */ }
    onLogin(res.data.accessToken);
  };

  const card = (
    <NmCard className="w-full max-w-sm p-6 sm:p-7">
      <div className="mb-5 flex flex-col items-center gap-2 text-center">
        <div className="flex size-14 items-center justify-center rounded-[18px] bg-background text-primary shadow-nm-sm">
          <GraduationCap className="size-7" />
        </div>
        <h1 className="text-[19px] font-extrabold text-foreground">Eduvo — O&apos;quvchi / Ota-ona</h1>
        <p className="text-[12.5px] font-medium text-muted">O&apos;quv markazi bergan login va parol bilan kiring</p>
      </div>
      {notice ? <p className="mb-4 text-center text-[12.5px] font-semibold text-muted">{notice}</p> : null}
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <FieldLabel htmlFor="portal-login">LOGIN</FieldLabel>
          <NmInput id="portal-login" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="o123 yoki v123" autoCapitalize="none" autoComplete="username" />
        </div>
        <div>
          <FieldLabel htmlFor="portal-pw">PAROL</FieldLabel>
          <NmPasswordInput id="portal-pw" ref={pwRef} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        {err ? <LoginError kind={err} /> : null}
        <NmButton type="submit" className="min-h-[46px]" disabled={busy}>{busy ? "Kirilmoqda..." : "Kirish"}</NmButton>
      </form>
      <LoginHelp />
    </NmCard>
  );
  if (bare) return card;
  return <div className="flex min-h-[70vh] items-center justify-center">{card}</div>;
}
