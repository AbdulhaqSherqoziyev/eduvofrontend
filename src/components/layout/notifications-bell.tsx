'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { formatDate } from '@/lib/utils/date';

interface Notice {
  id: string;
  type: string;
  title: string;
  body: string;
  studentName: string | null;
  createdAt: string;
}

const fetchNotices = () => api.get<Notice[]>('/notifications', { params: { limit: 15 } }).then((r) => r.data);

/** Topbar bell — click opens a recent-notifications panel. */
export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const query = useQuery({ queryKey: ['notifications'], queryFn: fetchNotices, refetchInterval: 60_000 });

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const items = query.data ?? [];
  const fresh = items.some((n) => Date.now() - new Date(n.createdAt).getTime() < 24 * 60 * 60 * 1000);

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        aria-label="Bildirishnomalar"
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-11 flex-shrink-0 items-center justify-center rounded-[13px] bg-background text-[#5b6b82] shadow-nm-sm nm-pressable"
      >
        <Bell className="size-5" strokeWidth={2} />
        {fresh ? <span className="absolute right-[11px] top-2.5 size-2 rounded-full border-2 border-background bg-danger" /> : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[52px] z-50 w-[340px] rounded-[18px] bg-background p-3 shadow-nm">
          <div className="flex items-center justify-between px-2 pb-2 pt-1">
            <span className="text-[13px] font-extrabold text-foreground">Bildirishnomalar</span>
            <span className="text-[11.5px] font-semibold text-muted">{items.length} ta</span>
          </div>
          <div className="flex max-h-[380px] flex-col gap-2 overflow-y-auto">
            {query.isLoading ? (
              <div className="px-2 py-4 text-[13px] font-semibold text-muted">Yuklanmoqda...</div>
            ) : items.length === 0 ? (
              <div className="px-2 py-4 text-[13px] font-semibold text-muted">Hozircha bildirishnoma yo&apos;q.</div>
            ) : (
              items.map((n) => (
                <div key={n.id} className="rounded-[13px] bg-background px-3.5 py-2.5 shadow-nm-inset-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[12.5px] font-bold text-foreground">{n.title}</span>
                    <span className="shrink-0 text-[10.5px] font-semibold text-[#9aa6b8]">{formatDate(n.createdAt)}</span>
                  </div>
                  <div className="mt-0.5 truncate text-[12px] font-medium text-muted">
                    {[n.studentName, n.body].filter(Boolean).join(' · ') || '—'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
