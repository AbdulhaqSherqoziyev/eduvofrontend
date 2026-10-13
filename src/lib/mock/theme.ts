/** Theme preference (README Platform rules): guest → localStorage, learner → PATCH /mock/me too. */
export const THEME_KEY = 'eduvo_mock_theme';
export type UiTheme = 'light' | 'dark';

export function currentTheme(): UiTheme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}
export function applyTheme(t: UiTheme) {
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem(THEME_KEY, t); } catch { /* private mode */ }
}
