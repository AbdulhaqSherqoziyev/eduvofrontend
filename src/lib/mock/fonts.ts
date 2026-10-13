/**
 * Mock-site fonts, self-hosted at build time by next/font (no request to Google from the visitor's
 * browser — GDPR). Design addendum §1.2: Manrope + Source Serif 4 always (preloaded, Latin);
 * script fonts only on their locales, never preloaded — the browser fetches a file only when a
 * glyph from its unicode-range is on the page.
 */
import {
  Manrope, Source_Serif_4, Noto_Sans_Arabic, Vazirmatn, Noto_Sans_Hebrew, Noto_Sans_Devanagari,
  Noto_Sans_Bengali, Noto_Sans_Thai, Noto_Sans,
} from 'next/font/google';

const ui = Manrope({ subsets: ['latin'], variable: '--f-ui', display: 'swap' });
const serif = Source_Serif_4({ subsets: ['latin'], weight: ['400', '600'], style: ['normal', 'italic'], variable: '--f-serif', display: 'swap' });
const ext = Noto_Sans({ subsets: ['cyrillic-ext'], variable: '--f-ext', display: 'swap', preload: false });
const arabic = Noto_Sans_Arabic({ subsets: ['arabic'], variable: '--f-arabic', display: 'swap', preload: false });
const persian = Vazirmatn({ subsets: ['arabic'], variable: '--f-persian', display: 'swap', preload: false });
const hebrew = Noto_Sans_Hebrew({ subsets: ['hebrew'], variable: '--f-hebrew', display: 'swap', preload: false });
const deva = Noto_Sans_Devanagari({ subsets: ['devanagari'], variable: '--f-deva', display: 'swap', preload: false });
const beng = Noto_Sans_Bengali({ subsets: ['bengali'], variable: '--f-beng', display: 'swap', preload: false });
const thai = Noto_Sans_Thai({ subsets: ['thai'], variable: '--f-thai', display: 'swap', preload: false });
/*
 * CJK (Noto Sans SC/TC/JP/KR) is deliberately NOT loaded yet: next/font puts every font's
 * @font-face list into the shared layout CSS, and the four CJK families alone are ~250 KB gzip of
 * render-blocking CSS on every page in every language. zh/ja/ko still render the English fallback,
 * so `--f-sc/--f-tc/--f-jp/--f-kr` stay unset and the stacks in mock.css fall through to the OS CJK
 * font. Add them back per locale (route-level CSS) when those translations ship.
 */

const SCRIPT: Record<string, string[]> = {
  ar: [arabic.variable], ur: [arabic.variable], fa: [persian.variable, arabic.variable], he: [hebrew.variable],
  hi: [deva.variable], bn: [beng.variable], th: [thai.variable],
};

/** className for `<html>`: the two base families + the script family of this locale (+ the Cyrillic/Greek safety net). */
export function fontVarsFor(lang: string): string {
  return [ui.variable, serif.variable, ...(SCRIPT[lang] ?? [ext.variable])].join(' ');
}
