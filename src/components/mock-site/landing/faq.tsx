'use client';
/** FAQ accordion — one item open at a time; first open by default (Landing.dc.html). */
import { useState } from 'react';
import { sx } from '@/lib/mock/sx';

export function FaqDesktop({ items }: { items: Array<{ q: string; a: string }> }) {
  const [open, setOpen] = useState(0);
  return (
    <div style={sx('display:flex;flex-direction:column;gap:14px')}>
      {items.map((f, i) => (
        <div key={i} className="m-faq" data-open={open === i}>
          <button type="button" className="m-faq__q" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
            <span>{f.q}</span><span className="m-faq__sign" aria-hidden>{open === i ? '−' : '+'}</span>
          </button>
          {open === i && <div style={sx('padding:0 22px 20px;color:var(--ink2);font-size:15px;line-height:1.65')}>{f.a}</div>}
        </div>
      ))}
    </div>
  );
}

export function FaqPhone({ items }: { items: Array<{ q: string; a: string }> }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="m-rows">
      {items.map((f, i) => (
        <div key={i}>
          <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}
            style={sx('width:100%;min-height:56px;border:0;background:transparent;cursor:pointer;color:var(--ink);padding:14px 16px;display:flex;align-items:center;gap:12px;text-align:start;font-size:15px;font-weight:700')}>
            <span style={sx('flex:1')}>{f.q}</span><span style={sx('font-size:20px;color:var(--blue);flex:none')} aria-hidden>{open === i ? '−' : '+'}</span>
          </button>
          {open === i && <div style={sx('padding:0 16px 16px;font-size:14px;line-height:1.6;color:var(--ink2)')}>{f.a}</div>}
        </div>
      ))}
    </div>
  );
}
