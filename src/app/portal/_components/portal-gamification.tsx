"use client";

import { useState } from "react";
import {
  Flame, Snowflake, Trophy, TrendingUp, Sparkles, Lock,
  Sprout, Rocket, BookOpen, Star, Crown,
  Send, FileCheck, Clock, Award, CalendarCheck, Zap,
  type LucideIcon,
} from "lucide-react";
import { NmCard } from "@/components/ui/nm-card";

// ===== API kontrakt (Bekzod bilan kelishilgan, spec §7) =====

export interface Gamification {
  attendanceCount: number;
  streak: { current: number; best: number; frozen: boolean };
  ratingBreakdown: { attendancePct: number; assignmentsPct: number | null };
  delta30: number | null;
  weekAttended: number;
  badges: {
    code: string;
    earned: boolean;
    earnedAt: string | null;
    progress: { current: number; target: number } | null;
  }[];
}

export const isNewStudent = (g: Gamification) => g.attendanceCount < 5;

// ===== Daraja jadvali (spec §3, frontendda hisoblanadi) =====

const LEVELS: { max: number; name: string; icon: LucideIcon }[] = [
  { max: 39, name: "Boshlovchi", icon: Sprout },
  { max: 59, name: "Intiluvchan", icon: Rocket },
  { max: 74, name: "Bilimdon", icon: BookOpen },
  { max: 89, name: "Yulduz", icon: Star },
  { max: 100, name: "Chempion", icon: Crown },
];

function levelIndex(rating: number) {
  const i = LEVELS.findIndex((l) => rating <= l.max);
  return i === -1 ? LEVELS.length - 1 : i;
}

// ===== Nishonlar meta (spec §4) =====

const BADGE_META: Record<string, { name: string; icon: LucideIcon; locked: string; earned: string }> = {
  FIRST_SUBMIT: { name: "Ilk qadam", icon: Send, locked: "Birinchi vazifani topshirish", earned: "Birinchi vazifa topshirildi" },
  SUBMIT_10: { name: "Mehnatkash", icon: FileCheck, locked: "Jami 10 ta vazifa topshirish", earned: "10 ta vazifa topshirildi" },
  ON_TIME_5: { name: "O'z vaqtida ×5", icon: Clock, locked: "5 ta vazifani muddatidan kechikmay topshirish", earned: "5 ta vazifa o'z vaqtida topshirildi" },
  SCORE_90_3: { name: "A'lochi", icon: Award, locked: "3 ta vazifaga 90+ ball olish", earned: "3 marta 90+ ball olindi" },
  FULL_WEEK: { name: "To'liq hafta", icon: CalendarCheck, locked: "Bir haftadagi barcha darslarga kelish", earned: "Bir haftaning barcha darslariga kelindi" },
  STREAK_10: { name: "Olovli 10", icon: Flame, locked: "10 dars ketma-ket kelish", earned: "10 darslik seriya qilindi" },
  STREAK_25: { name: "Olovli 25", icon: Zap, locked: "25 dars ketma-ket kelish", earned: "25 darslik seriya qilindi" },
};

// ===== Header chip (spec §1) =====

export function RatingChip({ rating, g, open, onToggle }: { rating: number; g: Gamification; open: boolean; onToggle: () => void }) {
  const isNew = isNewStudent(g);
  const Icon = isNew ? Sparkles : LEVELS[levelIndex(rating)].icon;
  return (
    <button type="button" onClick={onToggle} aria-expanded={open}
      className="flex min-h-10 items-center gap-1.5 rounded-ctl bg-background px-3 py-2 shadow-nm-inset-sm transition-all hover:shadow-nm-sm">
      <Icon className="size-4 text-primary" />
      {isNew ? (
        <span className="text-[13px] font-extrabold text-foreground">
          Yangi<span className="hidden min-[400px]:inline"> o&apos;quvchi</span>
        </span>
      ) : (
        <>
          <span className="text-[13px] font-extrabold text-foreground">{LEVELS[levelIndex(rating)].name}</span>
          <span className="text-[11px] font-bold text-muted">{rating}%</span>
        </>
      )}
    </button>
  );
}

function BreakdownRow({ label, pct, fill }: { label: string; pct: number | null; fill: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-[70px] shrink-0 text-[12px] text-muted">{label}</span>
      <span className="w-9 shrink-0 text-right text-[12px] font-extrabold text-foreground">{pct == null ? "—" : `${pct}%`}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-background shadow-nm-inset-sm">
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${Math.min(100, Math.max(0, pct ?? 0))}%` }} />
      </div>
    </div>
  );
}

export function RatingBreakdown({ g }: { g: Gamification }) {
  if (isNewStudent(g)) {
    return <p className="mt-3 text-[12px] text-muted">Reyting 5 ta darsdan so&apos;ng hisoblana boshlaydi.</p>;
  }
  return (
    <div className="mt-3 flex flex-col gap-1.5">
      <div className="text-[12px] font-bold text-foreground">Reyting qanday hisoblanadi?</div>
      <BreakdownRow label="Davomat" pct={g.ratingBreakdown.attendancePct} fill="bg-primary" />
      <BreakdownRow label="Vazifalar" pct={g.ratingBreakdown.assignmentsPct} fill="bg-success" />
      <p className="text-[11px] text-muted">Reyting — shu ikkisining o&apos;rtachasi.</p>
    </div>
  );
}

// ===== «Yutuqlaring» kartasi (spec §2) =====

function LevelBlock({ rating }: { rating: number }) {
  const i = levelIndex(rating);
  const lvl = LEVELS[i];
  const next = LEVELS[i + 1];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[12.5px] text-foreground">
        Daraja: <span className="font-bold">{lvl.name}</span> <span className="text-[11.5px] text-muted">· {rating}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-background shadow-nm-inset-sm">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, rating))}%` }} />
      </div>
      <div className="text-[11px] text-muted">
        {next ? `${next.name} darajasigacha: ${LEVELS[i].max + 1 - rating}%` : "Eng yuqori daraja — shunday davom et!"}
      </div>
    </div>
  );
}

function NewProgress({ count, label }: { count: number; label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-background shadow-nm-inset-sm">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (count / 5) * 100)}%` }} />
      </div>
      <span className="shrink-0 text-[11px] text-muted">{label ?? `${count}/5 dars`}</span>
    </div>
  );
}

export function StreakWell({ streak }: { streak: Gamification["streak"] }) {
  const frozen = streak.frozen && streak.current > 0;
  const active = streak.current > 0;
  return (
    <div className="rounded-[12px] bg-background px-3 py-2.5 shadow-nm-inset-sm">
      <div className="flex items-center gap-2">
        <Flame className={`size-5 ${active ? "text-warning" : "text-muted"}`} />
        {frozen ? <Snowflake className="size-4 text-primary" /> : null}
        {active ? (
          <span className="text-[15px] text-foreground">
            <span className="font-extrabold">{streak.current} dars ketma-ket</span>
            {frozen ? <span className="font-semibold"> · saqlanmoqda</span> : null}
          </span>
        ) : (
          <span className="text-[15px] font-extrabold text-foreground">Yangi seriya seni kutyapti</span>
        )}
      </div>
      {frozen ? (
        <p className="mt-1 text-[11.5px] text-muted">Sababli qoldirding — seriya saqlanadi, qaytganingda davom etadi.</p>
      ) : active ? (
        <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-muted">
          <Trophy className="size-3.5 text-muted" />Shaxsiy rekord: {streak.best} dars
        </div>
      ) : (
        <p className="mt-1 text-[11.5px] text-muted">
          Keyingi darsga kel — seriya 1 dan boshlanadi.{streak.best > 0 ? ` Rekording: ${streak.best} dars` : ""}
        </p>
      )}
    </div>
  );
}

function ParentFacts({ g }: { g: Gamification }) {
  const { current, best, frozen } = g.streak;
  return (
    <div className="flex flex-col gap-1.5 rounded-[12px] bg-background px-3 py-2.5 text-[12.5px] text-foreground shadow-nm-inset-sm">
      <div className="flex items-center gap-1.5">
        <CalendarCheck className="size-4 shrink-0 text-primary" />Bu hafta {g.weekAttended} darsga keldi
      </div>
      {current > 0 ? (
        <div className="flex items-center gap-1.5">
          <Flame className="size-4 shrink-0 text-muted" />Joriy seriya: {current} dars ketma-ket · Rekord: {best}
        </div>
      ) : (
        <div className="text-muted">Hozircha faol seriya yo&apos;q</div>
      )}
      {frozen && current > 0 ? <div className="text-muted">Seriya saqlangan (sababli qoldirilgan)</div> : null}
    </div>
  );
}

function BadgesSection({ g }: { g: Gamification }) {
  const [selected, setSelected] = useState<string | null>(null);
  const badges = g.badges.filter((b) => BADGE_META[b.code]);
  const sel = badges.find((b) => b.code === selected);
  const selMeta = sel ? BADGE_META[sel.code] : null;
  if (!badges.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[11px] font-bold uppercase tracking-wide text-muted">Nishonlar</div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {badges.map((b) => {
          const meta = BADGE_META[b.code];
          const Icon = meta.icon;
          const isSel = selected === b.code;
          return (
            <button key={b.code} type="button"
              onClick={() => setSelected(isSel ? null : b.code)}
              className={`flex min-w-[64px] flex-col items-center gap-1 rounded-[12px] p-1 ${isSel ? "ring-1 ring-primary/30" : ""}`}>
              <span className={`relative flex size-10 items-center justify-center rounded-full bg-background ${b.earned ? "shadow-nm-sm" : "shadow-nm-inset-sm"}`}>
                <Icon className={`size-5 ${b.earned ? "text-primary" : "text-muted opacity-50"}`} />
                {!b.earned ? (
                  <span className="absolute -right-0.5 -top-0.5 rounded-full bg-background p-0.5">
                    <Lock className="size-3 text-muted" />
                  </span>
                ) : null}
              </span>
              <span className={`line-clamp-2 text-center text-[10px] font-semibold leading-tight ${b.earned ? "text-foreground" : "text-muted"}`}>
                {meta.name}
              </span>
            </button>
          );
        })}
      </div>
      <div className="rounded-[12px] bg-background px-3 py-2.5 shadow-nm-inset-sm">
        {sel && selMeta ? (
          sel.earned ? (
            <p className="text-[12px] text-foreground">
              «{selMeta.name}» — {selMeta.earned}.{sel.earnedAt ? <span className="text-muted"> Olindi: {sel.earnedAt}</span> : null}
            </p>
          ) : (
            <p className="text-[12px] text-foreground">
              «{selMeta.name}» — {selMeta.locked}.{sel.progress ? ` Hozir: ${sel.progress.current}/${sel.progress.target}` : ""}
            </p>
          )
        ) : (
          <p className="text-[11.5px] text-muted">Nishonni bosib, qanday olishni ko&apos;r</p>
        )}
      </div>
    </div>
  );
}

/** `hideStreak`: the home screen shows the streak as its own row above this card
 *  (spec §6.1 order), so the card must not repeat it. */
export function GamificationCard({ g, rating, role, hideStreak }: { g: Gamification; rating: number; role: string; hideStreak?: boolean }) {
  const parent = role === "parent";
  const isNew = isNewStudent(g);

  return (
    <NmCard className="p-5">
      <div className="mb-3 text-[13px] font-extrabold text-foreground">{parent ? "O'qish ko'rsatkichlari" : "Yutuqlaring"}</div>
      <div className="flex flex-col gap-3">
        {isNew ? (
          parent ? (
            <>
              <p className="text-[12px] text-muted">Farzandingiz yaqinda qo&apos;shildi. Ko&apos;rsatkichlar 5 ta darsdan so&apos;ng ko&apos;rinadi.</p>
              <NewProgress count={g.attendanceCount} />
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Sparkles className="size-5 text-primary" />
              <div className="text-[15px] font-extrabold text-foreground">Xush kelibsiz!</div>
              <p className="text-[12px] text-muted">Reyting va dars seriyasi 5 ta darsdan so&apos;ng hisoblana boshlaydi.</p>
              <NewProgress count={g.attendanceCount} />
            </div>
          )
        ) : (
          <>
            {parent ? <ParentFacts g={g} /> : hideStreak ? null : <StreakWell streak={g.streak} />}
            <LevelBlock rating={rating} />
            {parent ? (
              g.delta30 != null && g.delta30 >= 1 ? (
                <p className="text-[11.5px] text-success">O&apos;tgan 30 kunga nisbatan +{g.delta30}%</p>
              ) : null
            ) : g.delta30 != null && g.delta30 >= 1 ? (
              <div className="flex items-center gap-1.5 self-start rounded-ctl bg-background px-3 py-1.5 shadow-nm-inset-sm">
                <TrendingUp className="size-3.5 text-success" />
                <span className="text-[11.5px] font-bold text-success">+{g.delta30}% o&apos;tgan 30 kunga nisbatan</span>
              </div>
            ) : (
              <p className="text-[11.5px] text-muted">Shu ruhda davom et!</p>
            )}
          </>
        )}
        <BadgesSection g={g} />
      </div>
    </NmCard>
  );
}
