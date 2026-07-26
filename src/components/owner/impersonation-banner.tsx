"use client";

import { useEffect, useState } from "react";
import { CornerUpLeft, Eye, LogOut } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  impersonationDepth,
  impersonationOrigin,
  stepBackImpersonation,
  stopImpersonation,
} from "@/lib/auth/impersonation";
import type { SessionUser } from "@/lib/auth/types";

/** Shown while logged-in "as" another user (owner→tenant→teacher, any depth). */
export function ImpersonationBanner() {
  const { user } = useAuth();
  const [depth, setDepth] = useState(0);
  const [origin, setOrigin] = useState<SessionUser | null>(null);
  useEffect(() => {
    setDepth(impersonationDepth());
    setOrigin(impersonationOrigin());
  }, []);
  if (depth === 0) return null;

  // Name the destination: after two hops "return" is ambiguous, and the OWNER
  // needs to see that the way home is still there.
  const home = origin?.isPlatform
    ? "ERS hisobimga qaytish"
    : origin?.fullName
      ? `${origin.fullName} hisobiga qaytish`
      : "O'z hisobimga qaytish";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 bg-[rgba(232,161,58,0.16)] px-4 py-2 text-[12.5px] font-bold text-warning">
      <Eye className="size-4" strokeWidth={2.2} />
      <span>
        Siz <b>{user?.fullName ?? "foydalanuvchi"}</b> sifatida kirgansiz
      </span>
      {depth > 1 ? (
        <button
          type="button"
          onClick={stepBackImpersonation}
          className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-foreground shadow-nm-sm hover:text-primary"
        >
          <CornerUpLeft className="size-3.5" strokeWidth={2.2} />
          Bir qadam orqaga
        </button>
      ) : null}
      <button
        type="button"
        onClick={stopImpersonation}
        className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-foreground shadow-nm-sm hover:text-primary"
      >
        <LogOut className="size-3.5" strokeWidth={2.2} />
        {home}
      </button>
    </div>
  );
}
