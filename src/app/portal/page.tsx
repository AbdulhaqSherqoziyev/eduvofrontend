"use client";

import { useEffect, useState } from "react";
import { MiniLogin } from "./_components/mini-login";
import { PortalOverview } from "./_components/portal-overview";
import { TeacherAttendance } from "./_components/teacher-attendance";

const PKEY = "eduvo_portal_token";
const TKEY = "eduvo_tg_teacher";

/** Standalone portal (browser): teacher attendance OR student/parent kabinet. */
export default function PortalPage() {
  const [portal, setPortal] = useState<string | null>(null);
  const [teacher, setTeacher] = useState<{ token: string; fullName: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPortal(window.localStorage.getItem(PKEY));
    try { const t = window.localStorage.getItem(TKEY); if (t) setTeacher(JSON.parse(t)); } catch { /* ignore */ }
    setReady(true);
  }, []);

  if (!ready) return null;
  const onTeacher = (token: string, fullName: string) => { const v = { token, fullName }; window.localStorage.setItem(TKEY, JSON.stringify(v)); setTeacher(v); };
  const onPortal = (t: string) => { window.localStorage.setItem(PKEY, t); setPortal(t); };
  const outTeacher = () => { window.localStorage.removeItem(TKEY); setTeacher(null); };
  const outPortal = () => { window.localStorage.removeItem(PKEY); setPortal(null); };

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        {teacher ? <TeacherAttendance token={teacher.token} fullName={teacher.fullName} onLogout={outTeacher} />
          : portal ? <PortalOverview token={portal} onLogout={outPortal} />
          : <MiniLogin onTeacher={onTeacher} onPortal={onPortal} />}
      </div>
    </main>
  );
}
