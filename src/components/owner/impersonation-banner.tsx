"use client";

import { useEffect, useState } from "react";
import { Eye, LogOut } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { isImpersonating, stopImpersonation } from "@/lib/auth/impersonation";

/** Shown while logged-in "as" another user (owner→tenant or director→staff/teacher). */
export function ImpersonationBanner() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(isImpersonating()); }, []);
  if (!show) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 bg-[rgba(232,161,58,0.16)] px-4 py-2 text-[12.5px] font-bold text-warning">
      <Eye className="size-4" strokeWidth={2.2} />
      <span>Siz <b>{user?.fullName ?? "foydalanuvchi"}</b> sifatida kirgansiz</span>
      <button type="button" onClick={stopImpersonation}
        className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-foreground shadow-nm-sm hover:text-primary">
        <LogOut className="size-3.5" strokeWidth={2.2} />O&apos;z hisobimga qaytish
      </button>
    </div>
  );
}
