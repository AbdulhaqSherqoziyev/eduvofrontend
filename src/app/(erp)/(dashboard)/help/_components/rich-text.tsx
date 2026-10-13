import { Fragment } from 'react';
import { highlightParts, type QueryUnit } from '@/lib/help/search';

const MARK = 'rounded-[4px] bg-[rgba(46,107,230,0.14)] px-0.5 text-inherit dark:bg-[rgba(79,131,240,0.25)]';
const PLACEHOLDER =
  'rounded-[6px] bg-[rgba(232,161,58,0.18)] px-1 font-bold text-[#7a4e0a] dark:text-[#f0bd5f]';

function Marked({ text, units }: { text: string; units?: QueryUnit[] }) {
  if (!units?.length) return <>{text}</>;
  return (
    <>
      {highlightParts(text, units).map((p, i) =>
        p.hit ? (
          <mark key={i} className={MARK}>
            {p.text}
          </mark>
        ) : (
          <Fragment key={i}>{p.text}</Fragment>
        ),
      )}
    </>
  );
}

interface RichProps {
  text: string;
  /** Search units to <mark>. */
  units?: QueryUnit[];
  /** Style `[...]` fill-in spots (parent replies, teacher brief). */
  placeholders?: boolean;
}

/**
 * Content inline markup: «…» = on-screen button/field name (bold, quotes kept,
 * §7.2); `[...]` = fill-in placeholder (§7.7). Brackets stay in the text so a
 * copy keeps them.
 */
export function Rich({ text, units, placeholders }: RichProps) {
  const re = placeholders ? /(«[^»]*»|\[[^\]]+\])/ : /(«[^»]*»)/;
  return (
    <>
      {text.split(re).map((part, i) => {
        if (!part) return null;
        if (part.startsWith('«')) {
          return (
            <b key={i} className="font-bold">
              <Marked text={part} units={units} />
            </b>
          );
        }
        if (placeholders && part.startsWith('[')) {
          return (
            <span key={i} className={PLACEHOLDER}>
              {part}
            </span>
          );
        }
        return <Marked key={i} text={part} units={units} />;
      })}
    </>
  );
}

/** First sentence of an answer: up to ". " / "? " / "! " before a capital or a quote (§7.2). */
export function splitFirstSentence(text: string): [string, string] {
  const m = /^(.+?[.!?])\s+(?=[\p{Lu}«"“])/u.exec(text);
  if (!m) return [text, ''];
  return [m[1], text.slice(m[0].length)];
}
