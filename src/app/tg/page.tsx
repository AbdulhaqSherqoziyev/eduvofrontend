"use client";

import { useEffect, useState } from "react";
import { MiniLogin } from "../portal/_components/mini-login";
import { PortalOverview } from "../portal/_components/portal-overview";
import { TeacherAttendance } from "../portal/_components/teacher-attendance";

const PKEY = "eduvo_portal_token";
const TKEY = "eduvo_tg_teacher";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface TgWebApp {
  initData?: string;
  ready: () => void;
  expand: () => void;
  setHeaderColor?: (c: string) => void;
  setBackgroundColor?: (c: string) => void;
}
declare global {
  interface Window { Telegram?: { WebApp?: TgWebApp } }
}

/** Telegram Mini App: teacher (attendance) OR student/parent (kabinet). Portal auto-logs-in via initData. */
export default function TgMiniApp() {
  const [portal, setPortal] = useState<string | null>(null);
  const [teacher, setTeacher] = useState<{ token: string; fullName: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [initData, setInitData] = useState<string | undefined>(undefined);

  useEffect(() => {
    try { const t = window.localStorage.getItem(TKEY); if (t) setTeacher(JSON.parse(t)); } catch { /* ignore */ }
    let done = false;
    const finish = (tok?: string | null) => {
      if (done) return;
      done = true;
      if (tok) { window.localStorage.setItem(PKEY, tok); setPortal(tok); }
      setReady(true);
    };
    const start = () => {
      const wa = window.Telegram?.WebApp;
      try { wa?.ready(); wa?.expand(); wa?.setBackgroundColor?.("#E8ECF3"); wa?.setHeaderColor?.("#E8ECF3"); } catch { /* older clients */ }
      const id = wa?.initData;
      if (id) setInitData(id);
      const stored = window.localStorage.getItem(PKEY);
      if (stored) return finish(stored);
      if (id) {
        fetch(`${API}/portal/tg-login`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ initData: id }),
        }).then((r) => (r.ok ? r.json() : null)).then((d) => finish(d?.accessToken)).catch(() => finish());
      } else finish();
    };
    if (window.Telegram?.WebApp) start();
    else {
      const s = document.createElement("script");
      s.src = "https://telegram.org/js/telegram-web-app.js";
      s.async = true; s.onload = start; s.onerror = () => finish();
      document.head.appendChild(s);
    }
  }, []);

  if (!ready) return <p className="py-16 text-center text-[13px] font-semibold text-muted">Yuklanmoqda...</p>;
  const onTeacher = (token: string, fullName: string) => { const v = { token, fullName }; window.localStorage.setItem(TKEY, JSON.stringify(v)); setTeacher(v); };
  const onPortal = (t: string) => { window.localStorage.setItem(PKEY, t); setPortal(t); };
  const outTeacher = () => { window.localStorage.removeItem(TKEY); setTeacher(null); };
  const outPortal = () => { window.localStorage.removeItem(PKEY); setPortal(null); };

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-3xl">
        {teacher ? <TeacherAttendance token={teacher.token} fullName={teacher.fullName} onLogout={outTeacher} />
          : portal ? <PortalOverview token={portal} onLogout={outPortal} />
          : <MiniLogin onTeacher={onTeacher} onPortal={onPortal} initData={initData} />}
      </div>
    </main>
  );
}
