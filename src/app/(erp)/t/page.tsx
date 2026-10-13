"use client";

import { useCallback, useEffect, useState } from "react";
import { MiniLogin } from "../portal/_components/mini-login";
import { TEACHER_KEY, clearSession } from "../portal/_lib/api";
import { TeacherApp } from "./_components/teacher-app";

/** The installable teacher app: today's lessons first, attendance in two taps. */
export default function TeacherPage() {
  const [teacher, setTeacher] = useState<{ token: string; fullName: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const t = window.localStorage.getItem(TEACHER_KEY);
      if (t) setTeacher(JSON.parse(t));
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  const onTeacher = (token: string, fullName: string) => {
    const v = { token, fullName };
    window.localStorage.setItem(TEACHER_KEY, JSON.stringify(v));
    setNotice("");
    setTeacher(v);
  };

  const signOut = useCallback((reason?: "auth") => {
    clearSession();
    setNotice(reason === "auth" ? "Xavfsizlik uchun qaytadan kiring." : "");
    setTeacher(null);
  }, []);

  // A password change mints a new token; the old one dies immediately.
  const adoptToken = (t: string) => {
    setTeacher((prev) => {
      const v = { token: t, fullName: prev?.fullName ?? "" };
      window.localStorage.setItem(TEACHER_KEY, JSON.stringify(v));
      return v;
    });
  };

  if (!ready) return null;
  if (teacher) return <TeacherApp token={teacher.token} fullName={teacher.fullName} onLogout={signOut} onToken={adoptToken} />;

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        {/* /t is the teacher's address, so the teacher's form is the one that opens. */}
        <MiniLogin onTeacher={onTeacher} onPortal={() => undefined} defaultTab="teacher" notice={notice} />
      </div>
    </main>
  );
}
