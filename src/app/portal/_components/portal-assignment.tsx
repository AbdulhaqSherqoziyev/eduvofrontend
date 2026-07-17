"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface AssignmentRow {
  id: string;
  title: string;
  description: string;
  group: string;
  dueDate: string;
  submitted: boolean;
  score: number | null;
  status: string | null;
  submissionContent: string;
  submissionLink: string;
  files: { name: string; url: string; size: number | null }[];
}

export function PortalAssignment({ a, role, token, onDone }: { a: AssignmentRow; role: string; token: string; onDone: () => void }) {
  const [content, setContent] = useState(a.submissionContent || "");
  const [link, setLink] = useState(a.submissionLink || "");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const graded = a.score != null;

  const submit = async () => {
    setBusy(true); setMsg("");
    try {
      const r = await fetch(`${API}/portal/assignments/${a.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content, link }),
      });
      if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(Array.isArray(d.message) ? d.message.join(", ") : d.message || "Xato"); }
      setMsg("ok"); setOpen(false); onDone();
    } catch (e) { setMsg(e instanceof Error ? e.message : "Xato"); } finally { setBusy(false); }
  };

  return (
    <div className="rounded-[12px] bg-background px-3 py-2.5 shadow-nm-inset-sm">
      <div className="flex justify-between gap-2 text-[12.5px]">
        <span className="font-bold text-foreground">{a.dueDate} · {a.title}</span>
        <span className={graded ? "font-bold text-primary" : a.submitted ? "font-bold text-success" : "font-bold text-danger"}>
          {graded ? `${a.score} ball` : a.submitted ? "Topshirilgan" : "Topshirilmagan"}
        </span>
      </div>
      {a.description ? <p className="mt-1 text-[12px] leading-relaxed text-muted">{a.description}</p> : null}
      {a.files?.length ? (
        <div className="mt-1.5 flex flex-wrap gap-2">
          {a.files.map((f, j) => (
            <a key={j} href={f.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-[9px] bg-background px-2.5 py-1 text-[11.5px] font-semibold text-primary shadow-nm-sm hover:shadow-nm-inset-sm">
              <Paperclip className="size-3.5" />{f.name}
            </a>
          ))}
        </div>
      ) : null}
      {a.submitted && a.submissionContent ? <p className="mt-1.5 text-[11.5px] text-muted"><b>Javobingiz:</b> {a.submissionContent}</p> : null}
      {a.submitted && a.submissionLink ? <a href={a.submissionLink} target="_blank" rel="noreferrer" className="mt-0.5 block text-[11.5px] font-semibold text-primary underline">{a.submissionLink}</a> : null}

      {role === "student" && !graded ? (
        <div className="mt-2">
          {open ? (
            <div className="flex flex-col gap-2">
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Javobingiz..." rows={3}
                className="w-full resize-y rounded-[10px] bg-background px-3 py-2 text-[12.5px] text-foreground shadow-nm-inset-sm outline-none" />
              <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Havola (ixtiyoriy): https://..."
                className="w-full rounded-[10px] bg-background px-3 py-2 text-[12.5px] text-foreground shadow-nm-inset-sm outline-none" />
              <div className="flex items-center gap-2">
                <button onClick={submit} disabled={busy} className="rounded-[9px] bg-background px-3 py-1.5 text-[11.5px] font-bold text-primary shadow-nm-sm hover:shadow-nm-inset-sm disabled:opacity-50">{busy ? "..." : "Topshirish"}</button>
                <button onClick={() => setOpen(false)} className="text-[11.5px] font-semibold text-muted">Bekor</button>
                {msg && msg !== "ok" ? <span className="text-[11px] font-bold text-danger">{msg}</span> : null}
              </div>
            </div>
          ) : (
            <button onClick={() => setOpen(true)} className="rounded-[9px] bg-background px-3 py-1.5 text-[11.5px] font-bold text-primary shadow-nm-sm hover:shadow-nm-inset-sm">
              {a.submitted ? "Qayta topshirish" : "Vazifani topshirish"}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
