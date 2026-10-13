/**
 * Help & legal (README §12): the four long-form policy pages and the support contacts.
 * `LEGAL_UPDATED` is the "Last updated" date on every policy page; bump it together with the copy in
 * messages/{en,uz,ru}/legal.json (and TERMS_VERSION in auth-flow when the Terms change).
 */
export const LEGAL_UPDATED = '2026-10-13';
export const LEGAL_DOCS = ['terms', 'privacy', 'refunds', 'cookies'] as const;
export type LegalDoc = (typeof LEGAL_DOCS)[number];

export const SUPPORT_EMAIL = 'support@eduvo.uz';
/**
 * Support Telegram handle (`@name`), from the build env. Not set → the Telegram card is not shown:
 * a guessed handle could belong to someone else.
 */
export const SUPPORT_TELEGRAM = (process.env.NEXT_PUBLIC_MOCK_SUPPORT_TELEGRAM || '').trim().replace(/^@?/, '@').replace(/^@$/, '');

/** One block of a policy section: a paragraph, or a bulleted list. */
export type LegalBlock = string | string[];
export interface LegalSection { id: string; h: string; body: LegalBlock[] }
