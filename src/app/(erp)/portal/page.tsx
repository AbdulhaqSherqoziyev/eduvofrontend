"use client";

import { useCallback, useEffect, useState } from "react";
import { MiniLogin } from "./_components/mini-login";
import { PortalOverview } from "./_components/portal-overview";
import { TeacherAttendance } from "./_components/teacher-attendance";
import { TEACHER_KEY, TOKEN_KEY, clearSession } from "./_lib/api";

/** Standalone portal (browser): teacher attendance OR student/parent kabinet. */
export default function PortalPage() {
  const [portal, setPortal] = useState<string | null>(null);
  const [teacher, setTeacher] = useState<{ token: string; fullName: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setPortal(window.localStorage.getItem(TOKEN_KEY));
    try { const t = window.localStorage.getItem(TEACHER_KEY); if (t) setTeacher(JSON.parse(t)); } catch { /* ignore */ }
    setReady(true);
  }, []);

  const onTeacher = (token: string, fullName: string) => {
    const v = { token, fullName };
    window.localStorage.setItem(TEACHER_KEY, JSON.stringify(v));
    setNotice("");
    setTeacher(v);
  };
  const onPortal = (t: string) => {
    window.localStorage.setItem(TOKEN_KEY, t);
    setNotice("");
    setPortal(t);
  };

  // Signing out wipes the cached answers too — one phone is often shared in a
  // family, so "log out" has to mean the next person sees nothing.
  const signOut = useCallback((reason?: "auth") => {
    clearSession();
    setNotice(reason === "auth" ? "Xavfsizlik uchun qaytadan kiring." : "");
    setPortal(null);
    setTeacher(null);
  }, []);

  if (!ready) return null;

  // A successful password change mints a new token and kills the old one on the
  // spot. Adopting it here is what stops "I changed my password" from meaning
  // "I am locked out".
  const adoptToken = (t: string) => {
    window.localStorage.setItem(TOKEN_KEY, t);
    setPortal(t);
  };

  if (teacher) return <TeacherAttendance token={teacher.token} fullName={teacher.fullName} onLogout={signOut} />;
  if (portal) return <PortalOverview token={portal} onLogout={signOut} onToken={adoptToken} />;

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <MiniLogin onTeacher={onTeacher} onPortal={onPortal} defaultTab="portal" notice={notice} />
      </div>
    </main>
  );
}
