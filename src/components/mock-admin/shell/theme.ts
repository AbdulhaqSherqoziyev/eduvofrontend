/** Admin theme: `data-theme` on <html>, saved as localStorage 'eduvoAdminTheme' (AdminSidebar.dc.html). */
export const ADMIN_THEME_KEY = 'eduvoAdminTheme';

/** Inline <head> script: the saved theme before first paint (default light, like the design). */
export const ADMIN_THEME_SCRIPT = `try{var t=localStorage.getItem('${ADMIN_THEME_KEY}');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light')}catch(e){}`;

export function toggleAdminTheme() {
  const el = document.documentElement;
  const next = el.dataset.theme === 'dark' ? 'light' : 'dark';
  el.dataset.theme = next;
  try {
    localStorage.setItem(ADMIN_THEME_KEY, next);
  } catch {
    /* private mode: the choice lasts for this page only */
  }
}
