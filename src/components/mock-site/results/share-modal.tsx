'use client';
/**
 * Results.dc.html "Share modal": square gradient result card (logo, score, CEFR / section scores,
 * "mock.eduvo.uz · Practice test"), Save image (drawn client-side on a canvas, contract §8 — the
 * server gives no image) and Copy link (R2 POST /mock/attempts/:id/share → public /{lang}/r/{token}).
 * Phones get the same content in a bottom sheet.
 */
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MockApiError } from '@/lib/mock/api/client';
import { createShare } from '@/lib/mock/api/endpoints';
import { PHONE_QUERY, useMedia } from '@/lib/mock/hooks/use-media';
import { sx } from '@/lib/mock/sx';
import { BottomSheet } from '../bottom-sheet';
import { BRAND_BLUE, MarkSvg } from '../logo';
import { Modal } from '../modal';
import { useToast } from '../toast';

export interface ShareView { label: string; score: string; sub: string }

/** The card itself (also used by the public /r/{token} page). */
export function ShareCardView({ v, footer }: { v: ShareView; footer: string }) {
  return (
    <div dir="ltr" style={sx('aspect-ratio:1/1;border-radius:20px;background:linear-gradient(160deg,#5B8DEF,#2E6BE6);color:#fff;padding:28px;display:flex;flex-direction:column;justify-content:space-between;text-align:start')}>
      <span style={sx('font-weight:800;font-size:15px;display:flex;gap:8px;align-items:center')}>
        {/* the real Eduvo mark; a thin white ring keeps it apart from the blue card */}
        <span style={sx('width:26px;height:26px;border-radius:6.5px;box-shadow:0 0 0 1.5px #fff;flex:none')} aria-hidden>
          <MarkSvg size={26} />
        </span>Eduvo Mock
      </span>
      <div style={sx('display:flex;flex-direction:column;gap:4px')}>
        <span style={sx('font-size:14px;font-weight:700;opacity:.9')}>{v.label}</span>
        <span style={sx('font-size:clamp(64px,22vw,96px);font-weight:800;letter-spacing:-0.05em;line-height:1')}>{v.score}</span>
        <span style={sx('font-size:14px;font-weight:700')}>{v.sub}</span>
      </div>
      <span style={sx('font-size:12px;opacity:.85')}>{footer}</span>
    </div>
  );
}

/** 1080×1080 PNG of the card. Uses the page's loaded UI font (next/font family name). */
async function drawCard(v: ShareView, footer: string): Promise<Blob | null> {
  const S = 1080, k = S / 384; // design card ≈ 384 px wide
  const c = document.createElement('canvas');
  c.width = S; c.height = S;
  const g = c.getContext('2d');
  if (!g) return null;
  const family = getComputedStyle(document.body).fontFamily || 'sans-serif';
  await document.fonts?.ready;
  const grad = g.createLinearGradient(S * 0.33, 0, S * 0.67, S); // 160deg
  grad.addColorStop(0, '#5B8DEF'); grad.addColorStop(1, '#2E6BE6');
  g.fillStyle = grad; g.fillRect(0, 0, S, S);
  const pad = 28 * k;
  // the Eduvo mark (64 grid: #3D7BF0 square rx 16 + white diamond 24 rx 7 at 45°) with a white ring
  const tile = 26 * k, u = tile / 64, ring = 1.5 * k;
  g.fillStyle = '#fff';
  g.beginPath(); g.roundRect(pad - ring, pad - ring, tile + 2 * ring, tile + 2 * ring, 16 * u + ring); g.fill();
  g.fillStyle = BRAND_BLUE;
  g.beginPath(); g.roundRect(pad, pad, tile, tile, 16 * u); g.fill();
  g.save();
  g.translate(pad + 32 * u, pad + 32 * u); g.rotate(Math.PI / 4);
  g.fillStyle = '#fff';
  g.beginPath(); g.roundRect(-12 * u, -12 * u, 24 * u, 24 * u, 7 * u); g.fill();
  g.restore();
  g.fillStyle = '#fff'; g.textBaseline = 'middle';
  g.font = `800 ${15 * k}px ${family}`;
  g.fillText('Eduvo Mock', pad + tile + 8 * k, pad + tile / 2);
  // score block (bottom-aligned above the footer)
  g.textBaseline = 'alphabetic';
  g.font = `600 ${12 * k}px ${family}`; g.globalAlpha = 0.85;
  g.fillText(footer, pad, S - pad);
  g.globalAlpha = 1;
  g.font = `700 ${14 * k}px ${family}`;
  const subY = S - pad - 52 * k;
  g.fillText(v.sub, pad, subY);
  g.font = `800 ${96 * k}px ${family}`;
  g.fillText(v.score, pad, subY - 26 * k);
  g.font = `700 ${14 * k}px ${family}`; g.globalAlpha = 0.9;
  g.fillText(v.label, pad, subY - 26 * k - 88 * k);
  g.globalAlpha = 1;
  return new Promise((r) => c.toBlob((b) => r(b), 'image/png'));
}

export function ShareModal({ open, onClose, view, attemptId, sampleUrl, ready }: {
  open: boolean; onClose: () => void; view: ShareView; attemptId?: string; sampleUrl?: string; ready: boolean;
}) {
  const t = useTranslations('results.shareModal');
  const toast = useToast();
  const isPhone = useMedia(PHONE_QUERY);
  const [url, setUrl] = useState<string | null>(sampleUrl ?? null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => { if (!open) { setCopied(false); setErr(''); } }, [open]);

  const ensureUrl = async (): Promise<string | null> => {
    if (url) return url;
    if (!attemptId) return null;
    setBusy(true); setErr('');
    try { const r = await createShare(attemptId); setUrl(r.url); return r.url; }
    catch (e) { setErr(e instanceof MockApiError && e.code === 'RESULT_NOT_READY' ? t('notReady') : t('linkErr')); return null; }
    finally { setBusy(false); }
  };
  const copy = async () => {
    const u = await ensureUrl();
    if (!u) return;
    try { await navigator.clipboard.writeText(u); setCopied(true); toast(t('copied')); }
    catch { window.prompt(t('copyManual'), u); }
  };
  const save = async () => {
    const blob = await drawCard(view, t('footer'));
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'eduvo-mock-result.png';
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    toast(t('saved'));
  };

  const body = (
    <>
      <ShareCardView v={view} footer={t('footer')} />
      {!ready && <div className="m-banner m-banner--info">{t('notReady')}</div>}
      {err && <div className="m-banner m-banner--err" role="alert">{err}</div>}
      <div style={sx('display:grid;grid-template-columns:1fr 1fr;gap:10px')}>
        <button type="button" className="m-btn m-btn--primary" disabled={!ready} onClick={() => void save()} style={sx('height:48px;border-radius:13px;font-weight:700')}>{t('save')}</button>
        <button type="button" className="m-btn m-btn--soft" disabled={!ready || busy} onClick={() => void copy()} style={sx('height:48px;border-radius:13px;font-weight:700')}>{busy && <span className="m-spin" aria-hidden />}{copied ? t('copied') : t('copy')}</button>
      </div>
    </>
  );
  if (isPhone) return <BottomSheet open={open} title={t('title')} onClose={onClose}><div style={sx('display:flex;flex-direction:column;gap:14px')}>{body}</div></BottomSheet>;
  return (
    <Modal open={open} onClose={onClose} label={t('title')}>
      <div style={sx('display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:18px')}>{t('title')}<button type="button" onClick={onClose} style={sx('border:0;background:transparent;color:var(--ink2);font-weight:700;cursor:pointer;font-size:14px')}>{t('close')}</button></div>
      {body}
    </Modal>
  );
}
