/**
 * Inline links inside help/legal copy, so translators keep plain strings:
 * `[label](/path)` → link under the current locale; `eduvo.erp@gmail.com` → mailto; `paddle.net` → https link.
 */
import Link from 'next/link';
import { Fragment } from 'react';

const TOKEN = /\[([^\]]+)\]\((\/[^)\s]*)\)|([\w.+-]+@[\w-]+\.[\w.]+[\w])|\b(paddle\.net)\b/g;

export function RichLine({ text, lang }: { text: string; lang: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push(<Fragment key={k++}>{text.slice(last, i)}</Fragment>);
    if (m[1]) out.push(<Link key={k++} href={`/${lang}${m[2]}`}>{m[1]}</Link>);
    else if (m[3]) out.push(<a key={k++} href={`mailto:${m[3]}`}><bdi dir="ltr">{m[3]}</bdi></a>);
    else if (m[4]) out.push(<a key={k++} href="https://www.paddle.net" target="_blank" rel="noopener noreferrer"><bdi dir="ltr">{m[4]}</bdi></a>);
    last = i + m[0].length;
  }
  if (last < text.length) out.push(<Fragment key={k++}>{text.slice(last)}</Fragment>);
  return <>{out}</>;
}
