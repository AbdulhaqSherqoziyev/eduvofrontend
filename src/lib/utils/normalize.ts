/** Login input cleaning — strip stray spaces / invisible chars so a typed or
 *  pasted phone/password never fails to match because of whitespace. */

// Zero-width space / non-joiner / joiner / BOM — invisible junk from copy-paste.
const ZERO_WIDTH = /[\u200B\u200C\u200D\uFEFF]/g;

/** Remove every space and invisible character (used for the password field). */
export function stripSpaces(input: string): string {
  return input.replace(/\s/g, '').replace(ZERO_WIDTH, '');
}

/**
 * Light cleaning for the phone field while typing: drop invisible chars, collapse
 * a doubled "+998" prefix (when the user types the full number over the prefilled
 * +998) and runs of spaces. The backend matches on the national digits, so exact
 * formatting is never required to log in.
 */
export function cleanPhone(input: string): string {
  return input
    .replace(ZERO_WIDTH, '')
    .replace(/^\s*\+?998\s*\+?998\s*/, '+998 ')
    .replace(/ {2,}/g, ' ')
    .replace(/^\s+/, '');
}
