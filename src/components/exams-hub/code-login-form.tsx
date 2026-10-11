'use client';
/** CodeLoginForm `/exams/login` (§7 + round 2): one error block, never says which field was wrong. */
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NmButton } from '@/components/ui/nm-button';
import { NmCard } from '@/components/ui/nm-card';
import { NmInput } from '@/components/ui/nm-input';
import { HubError, hubNow } from '@/lib/exam/hub-api';
import { dayLong, hm } from '@/lib/exam/hub-format';
import { ht } from '@/lib/exam/i18n/hub';
import { saveCodeSession } from '@/lib/exam/session';
import { useCodeLogin } from '@/lib/exam/use-hub';

type Msg = { tone: 'error' | 'info'; text: string } | null;
/** Backend accepts 6–12 letters/digits, any case; spaces and hyphens are typing noise. */
const cleanCode = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

export function CodeLoginForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const login = useCodeLogin();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<Msg>(null);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const tm = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(tm);
  }, [wait]);
  useEffect(() => {
    if (msg?.text.startsWith('#wait') && wait <= 0) setMsg(null);
  }, [wait, msg]);

  const ready = name.trim().length >= 2 && code.length >= 6 && wait <= 0 && !login.isPending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setMsg(null);
    try {
      const r = await login.mutateAsync({ code, fullName: name.trim().replace(/\s+/g, ' ') });
      saveCodeSession(r);
      qc.removeQueries({ queryKey: ['exams-hub'] });
      router.replace(`/exams/${encodeURIComponent(r.assignment.examCode)}`);
    } catch (err) {
      const x = err instanceof HubError ? err : null;
      if (x?.code === 'TOO_MANY_ATTEMPTS') {
        setWait(Number(x.body?.retryAfterSec) || 60);
        setMsg({ tone: 'error', text: '#wait' });
      } else if (x?.code === 'OUTSIDE_WINDOW') {
        const ws = String(x.body?.windowStart ?? '');
        const we = String(x.body?.windowEnd ?? '');
        setMsg(ws && hubNow() < Date.parse(ws)
          ? { tone: 'info', text: ht('errors.window_not_open', { date: dayLong(ws), time: hm(ws) }) }
          : { tone: 'info', text: ht('errors.window_closed', { date: dayLong(we), time: hm(we) }) });
      } else if (x?.code === 'MODULE_DISABLED') {
        setMsg({ tone: 'error', text: `${ht('hubx.module_off_title')}. ${ht('hubx.module_off_body')}` });
      } else if (x?.kind === 'network' || x?.kind === 'server') {
        setMsg({ tone: 'error', text: ht('hubx.login_offline') });
      } else {
        setMsg({ tone: 'error', text: ht('hub.code_mismatch') });
      }
    }
  }

  const text = msg?.text === '#wait' ? ht('hub.too_many_tries', { s: Math.max(wait, 0) }) : msg?.text;
  return (
    <NmCard className="flex w-[calc(100%-32px)] max-w-[420px] flex-col gap-5 rounded-[28px] p-8 max-sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#5B8DEF] to-[#2E6BE6] text-[18px] font-extrabold text-white">E</span>
        <span className="text-[15px] font-extrabold text-foreground">Eduvo<span className="font-semibold text-muted">{ht('hubx.brand_sub')}</span></span>
      </div>
      <div>
        <h1 className="text-[22px] font-extrabold tracking-[-0.4px] text-foreground">{ht('hubx.login_title')}</h1>
        <p className="mt-1.5 text-[13.5px] font-medium leading-[1.55] text-[#5b6b82]">{ht('hubx.login_lead')}</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <label className="flex flex-col gap-1.5 text-[12.5px] font-bold text-[#5b6b82]">
          {ht('hubx.login_name')}
          <NmInput className="max-sm:h-[52px]" value={name} onChange={(e) => setName(e.target.value)} placeholder="Karimova Aziza" autoComplete="name" maxLength={120} />
        </label>
        <label className="flex flex-col gap-1.5 text-[12.5px] font-bold text-[#5b6b82]">
          {ht('hubx.login_code')}
          <NmInput className="text-[20px] font-extrabold uppercase tracking-[4px] max-sm:h-[52px]" value={code} onChange={(e) => setCode(cleanCode(e.target.value))}
            placeholder="A7K29Q" autoComplete="one-time-code" autoCapitalize="characters" spellCheck={false} inputMode="text" />
        </label>
        {text ? (
          <div role={msg?.tone === 'error' ? 'alert' : 'status'} className="flex items-start gap-2">
            {msg?.tone === 'error' ? <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#E4574C]" aria-hidden /> : <Clock className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />}
            <span className={msg?.tone === 'error' ? 'text-[13px] font-semibold text-[#B23A2E]' : 'text-[13px] font-semibold text-[#5b6b82]'}>{text}</span>
          </div>
        ) : null}
        <NmButton type="submit" size="lg" className="h-12 w-full" disabled={!ready} aria-disabled={!ready}>
          {login.isPending ? ht('hubx.login_checking') : ht('hubx.login_submit')}
        </NmButton>
      </form>
      <p className="text-[12px] font-semibold text-muted">
        {ht('hubx.login_cabinet')} <Link href="/portal" className="text-primary hover:underline">{ht('hubx.login_cabinet_link')}</Link>
      </p>
    </NmCard>
  );
}
