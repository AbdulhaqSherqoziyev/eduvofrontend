'use client';
/**
 * "Havola yasash" (spec §5.4, Q8) — frontend only.
 * eduvo.uz: https://eduvo.uz<page>?<utm> · mock: https://mock.eduvo.uz/<lang><page>?<utm> (never the internal /m/).
 * Param order is fixed: utm_source, utm_medium, utm_campaign, utm_content (omitted when empty).
 */
import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Section } from '@/components/owner/section';
import { NmButton } from '@/components/ui/nm-button';
import { NmInput } from '@/components/ui/nm-input';
import { NmSelect } from '@/components/ui/nm-select';
import { FieldLabel } from '@/components/ui/label';
import { LOCALES, LOCALE_NAMES, isTranslated, type MockLocale } from '@/i18n/locales';
import type { WebSite } from '@/lib/api/owner-analytics.types';

const PAGES: Record<WebSite, Array<[string, string]>> = {
  landing: [['/', 'Bosh sahifa'], ['/signup.html', "Ro'yxatdan o'tish"]],
  mock: [['', 'Bosh sahifa'], ['/ielts', 'IELTS'], ['/sat', 'SAT'], ['/pricing', 'Narxlar'], ['/how-it-works', 'Qanday ishlaydi'], ['/sample-result', 'Namuna natija']],
};
const CHANNELS: Array<{ key: string; label: string; source: string; medium: string }> = [
  { key: 'telegram', label: 'Telegram', source: 'telegram', medium: 'social' },
  { key: 'instagram', label: 'Instagram', source: 'instagram', medium: 'social' },
  { key: 'facebook', label: 'Facebook', source: 'facebook', medium: 'social' },
  { key: 'google', label: 'Google reklama', source: 'google', medium: 'cpc' },
  { key: 'youtube', label: 'YouTube', source: 'youtube', medium: 'video' },
  { key: 'sms', label: 'SMS', source: 'sms', medium: 'sms' },
  { key: 'other', label: 'Boshqa…', source: '', medium: 'other' },
];
/** O'zbekcha, Русский, English first, then the rest in LOCALES order. */
const LANGS: MockLocale[] = ['uz', 'ru', 'en', ...LOCALES.filter((l) => l !== 'uz' && l !== 'ru' && l !== 'en')];
const RECENT_KEY = 'ers.analytics.utm.recent';

/** Lower case, latin, spaces → "-", only [a-z0-9-], ≤ 40. */
export function cleanSlug(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40);
}

export function buildUtmUrl(o: { site: WebSite; page: string; lang: string; source: string; medium: string; campaign: string; content: string }): string {
  const base = o.site === 'landing' ? `https://eduvo.uz${o.page}` : `https://mock.eduvo.uz/${o.lang}${o.page}`;
  const parts: Array<[string, string]> = [['utm_source', o.source], ['utm_medium', o.medium], ['utm_campaign', o.campaign], ['utm_content', o.content]];
  const qs = parts.filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  return `${base}?${qs}`;
}

function readRecent(): string[] {
  try { const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); return Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 5) : []; } catch { return []; }
}

export function UtmBuilder({ defaultSite }: { defaultSite: WebSite }) {
  const [site, setSite] = useState<WebSite>(defaultSite);
  const [page, setPage] = useState(PAGES[defaultSite][0][0]);
  const [lang, setLang] = useState<string>('uz');
  const [channel, setChannel] = useState('telegram');
  const [otherSource, setOtherSource] = useState('');
  const [campaign, setCampaign] = useState('');
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setRecent(readRecent()); }, []);
  useEffect(() => { setSite(defaultSite); setPage(PAGES[defaultSite][0][0]); }, [defaultSite]);

  const ch = CHANNELS.find((c) => c.key === channel)!;
  const source = channel === 'other' ? otherSource : ch.source;
  const ready = !!campaign && !!source;
  const url = ready ? buildUtmUrl({ site, page, lang, source, medium: ch.medium, campaign, content }) : '';

  const remember = (u: string) => {
    const next = [u, ...readRecent().filter((x) => x !== u)].slice(0, 5);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setRecent(next);
  };

  const selectResult = () => {
    const el = resultRef.current;
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  const copy = async (u: string, main: boolean) => {
    try {
      await navigator.clipboard.writeText(u);
      if (main) { setCopied(true); setCopyFailed(false); setTimeout(() => setCopied(false), 2000); }
      remember(u);
    } catch {
      if (main) { setCopyFailed(true); selectResult(); }
    }
  };

  return (
    <Section title="Havola yasash">
      <p className="text-[13px] font-medium text-muted">Reklama yoki postga qo&apos;yiladigan havola. Shu havoladan kelganlarni &quot;Kampaniya&quot; ko&apos;rinishida ko&apos;rasiz.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="utm-site">Sayt</FieldLabel>
          <NmSelect id="utm-site" value={site} onChange={(e) => { const s = e.target.value as WebSite; setSite(s); setPage(PAGES[s][0][0]); }}>
            <option value="landing">eduvo.uz</option>
            <option value="mock">mock.eduvo.uz</option>
          </NmSelect>
        </div>
        <div>
          <FieldLabel htmlFor="utm-page">Sahifa</FieldLabel>
          <NmSelect id="utm-page" value={page} onChange={(e) => setPage(e.target.value)}>
            {PAGES[site].map(([v, l]) => <option key={v || 'home'} value={v}>{l}</option>)}
          </NmSelect>
        </div>
        {site === 'mock' ? (
          <div>
            <FieldLabel htmlFor="utm-lang">Til</FieldLabel>
            <NmSelect id="utm-lang" value={lang} onChange={(e) => setLang(e.target.value)}>
              {LANGS.map((l) => <option key={l} value={l}>{LOCALE_NAMES[l]}{isTranslated(l) ? '' : ' (inglizcha matn)'}</option>)}
            </NmSelect>
          </div>
        ) : null}
        <div>
          <FieldLabel htmlFor="utm-channel">Kanal</FieldLabel>
          <NmSelect id="utm-channel" value={channel} onChange={(e) => setChannel(e.target.value)}>
            {CHANNELS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </NmSelect>
        </div>
        {channel === 'other' ? (
          <div>
            <FieldLabel htmlFor="utm-source">Manba</FieldLabel>
            <NmInput id="utm-source" value={otherSource} onChange={(e) => setOtherSource(cleanSlug(e.target.value))} />
          </div>
        ) : null}
        <div>
          <FieldLabel htmlFor="utm-campaign">Kampaniya nomi</FieldLabel>
          <NmInput id="utm-campaign" required placeholder="masalan: kuz-aksiya" value={campaign} aria-describedby="utm-campaign-hint"
            onChange={(e) => setCampaign(cleanSlug(e.target.value))} />
          <p id="utm-campaign-hint" className="mt-1.5 text-[12px] font-medium text-muted">Lotin harflarida, bo&apos;sh joysiz.</p>
        </div>
        <div>
          <FieldLabel htmlFor="utm-content">Qo&apos;shimcha belgi (ixtiyoriy)</FieldLabel>
          <NmInput id="utm-content" placeholder="masalan: post-1" value={content} onChange={(e) => setContent(cleanSlug(e.target.value))} />
        </div>
      </div>
      <div ref={resultRef} className="rounded-[12px] bg-background p-3 font-mono text-[12.5px] break-all text-foreground shadow-nm-inset-sm" aria-live="polite">
        {url || <span className="font-sans font-medium text-muted">Kampaniya nomini yozing</span>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <NmButton size="sm" disabled={!url} onClick={() => copy(url, true)}>
          {copied ? <><Check className="size-4" aria-hidden />Nusxalandi</> : <><Copy className="size-4" aria-hidden />Nusxa olish</>}
        </NmButton>
        {copyFailed ? <span className="text-[12px] font-medium text-muted">Nusxalab bo&apos;lmadi — havolani qo&apos;lda belgilab oling</span> : null}
      </div>
      {recent.length ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-muted">Oxirgi havolalar</span>
          <ul className="flex flex-col gap-1">
            {recent.map((u) => (
              <li key={u} className="flex items-center gap-2">
                <NmButton variant="ghost" size="sm" className="h-8 w-8 flex-shrink-0 px-0" aria-label="Nusxa olish" onClick={() => copy(u, false)}>
                  <Copy className="size-4" aria-hidden />
                </NmButton>
                <span className="min-w-0 break-all font-mono text-[12px] text-muted">{u}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Section>
  );
}
