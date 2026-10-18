/** SVG line/area paths in the design's 600×220 frame (Dashboard "Daromad · kunlar bo'yicha"). */
export function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

/** design `path()`: x 0..W, y = H−10 − v/max·(H−30) */
export function linePath(vals: number[], max: number, close = false, W = 600, H = 220) {
  const n = vals.length;
  if (!n) return '';
  const pts = vals.map((v, i) => [n === 1 ? 0 : (i / (n - 1)) * W, H - 10 - (v / max) * (H - 30)]);
  const d = 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L');
  return close ? `${d}L${W} ${H}L0 ${H}Z` : d;
}

/** 5 evenly spaced labels (first … last) */
export function axisLabels<T>(items: T[], label: (t: T) => string, n = 5) {
  if (!items.length) return [];
  if (items.length <= n) return items.map(label);
  return Array.from({ length: n }, (_, i) => label(items[Math.round((i / (n - 1)) * (items.length - 1))]));
}
