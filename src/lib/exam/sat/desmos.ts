/**
 * Desmos API loader (sat.md §6.1). The script (~4 MB) is fetched only when a
 * SAT Math module mounts the calculator — never on the R&W or IELTS screens.
 *
 * Key: `NEXT_PUBLIC_DESMOS_API_KEY` (Commercial plan — Abdulhaq). Without it the
 * public demo key from the Desmos docs is used in development builds only; a
 * production build NEVER falls back to the demo key (Desmos terms — there is no
 * env override on purpose) and shows "calculator not available" instead.
 * `NEXT_PUBLIC_DESMOS_SRC` points at a self-hosted copy (Davron, CSP `'self'`).
 */

const DEMO_KEY = 'dcb31709b452b1cf9dc26972add0fda6';
const VERSION = 'v1.13';

export interface DesmosCalc { destroy(): void; resize(): void; updateSettings(o: Record<string, unknown>): void }
interface DesmosNS {
  GraphingCalculator(el: HTMLElement, opts?: Record<string, unknown>): DesmosCalc;
  ScientificCalculator(el: HTMLElement, opts?: Record<string, unknown>): DesmosCalc;
}

function apiKey(): string | null {
  const own = process.env.NEXT_PUBLIC_DESMOS_API_KEY;
  if (own) return own;
  return process.env.NODE_ENV === 'production' ? null : DEMO_KEY;
}

export function desmosAvailable(): boolean {
  return !!process.env.NEXT_PUBLIC_DESMOS_SRC || apiKey() != null;
}

function scriptSrc(): string {
  const self = process.env.NEXT_PUBLIC_DESMOS_SRC;
  if (self) return self;
  return `https://www.desmos.com/api/${VERSION}/calculator.js?apiKey=${encodeURIComponent(apiKey() ?? '')}`;
}

let pending: Promise<DesmosNS> | null = null;

export function loadDesmos(): Promise<DesmosNS> {
  const w = window as unknown as { Desmos?: DesmosNS };
  if (w.Desmos) return Promise.resolve(w.Desmos);
  if (!desmosAvailable()) return Promise.reject(new Error('desmos: no key'));
  if (pending) return pending;
  pending = new Promise<DesmosNS>((resolve, reject) => {
    const el = document.createElement('script');
    el.src = scriptSrc();
    el.async = true;
    el.dataset.examDesmos = '1';
    el.onload = () => (w.Desmos ? resolve(w.Desmos) : reject(new Error('desmos: no global')));
    el.onerror = () => { el.remove(); reject(new Error('desmos: load failed')); };
    document.head.appendChild(el);
  }).catch((e) => { pending = null; throw e; });
  return pending;
}

/** Bluebook-like settings (sat.md §6.1): no images/folders/notes/links, keypad on, radians. */
export const GRAPHING_OPTS = {
  images: false, folders: false, notes: false, links: false, settingsMenu: true, keypad: true,
  expressions: true, zoomButtons: true, degreeMode: false, border: false, expressionsCollapsed: false,
};
export const SCIENTIFIC_OPTS = { degreeMode: false, links: false, border: false };
