/**
 * Mock test-bank builders: compact authoring shapes → contract `Part[]` plus
 * the answer keys (kept only inside the mock, like the server keeps them).
 */
import type { GroupContent, QuestionContent } from '../content-types';
import type { Part } from '../types';

export interface MockQ { no: number; type: string; content?: QuestionContent; key: string[]; why?: string; anchor?: string }
export interface MockGroup { layout: string; instructions: string; content?: GroupContent; multiGroup?: boolean; qs: MockQ[] }
export interface MockPart {
  part: number;
  title?: string;
  instructions?: string;
  passage?: [string, string][];
  audioSec?: number;
  groups: MockGroup[];
}

export interface KeyRow { no: number; type: string; sectionKey: string; key: string[]; why?: string; anchor?: string; part: number }
export interface BuiltStage { parts: Part[]; keys: Record<string, KeyRow>; audio: { assetId: string; durationMs: number }[] }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function qid(stageKey: string, no: number) {
  return `${stageKey}-q${no}`;
}

export function buildStage(sectionKey: string, stageKey: string, parts: MockPart[]): BuiltStage {
  const keys: BuiltStage['keys'] = {};
  const audio: BuiltStage['audio'] = [];
  const out: Part[] = parts.map((p) => {
    const paraText = (pid: string) => p.passage?.find(([k]) => k === pid)?.[1] ?? '';
    const audioAssetId = p.audioSec ? `${stageKey}-audio-${p.part}` : null;
    if (audioAssetId && p.audioSec) audio.push({ assetId: audioAssetId, durationMs: p.audioSec * 1000 });
    return {
      part: p.part,
      title: p.title ?? null,
      instructions: p.instructions ?? null,
      passageHtml: p.passage ? p.passage.map(([pid, text]) => `<p data-pid="${esc(pid)}">${esc(text)}</p>`).join('') : null,
      imageAssetId: null,
      audioAssetId,
      audioDurationMs: p.audioSec ? p.audioSec * 1000 : null,
      groups: p.groups.map((g, gi) => ({
        id: `${stageKey}-g${p.part}-${gi}`,
        layout: g.layout,
        instructions: g.instructions,
        content: g.content ?? null,
        multiGroup: !!g.multiGroup,
        questions: g.qs.map((q) => {
          const id = qid(stageKey, q.no);
          keys[id] = { no: q.no, type: q.type, sectionKey, key: q.key, why: q.why, anchor: toAnchor(q.anchor, paraText), part: p.part };
          return { id, no: q.no, type: q.type, check: q.type === 'gap_fill' ? 'text_normalized' : 'exact', content: q.content ?? {}, points: 1 };
        }),
      })),
    };
  });
  return { parts: out, keys, audio };
}

/** Author anchors as "A|phrase"; the wire format is "A:start-end" (offsets in the paragraph text). */
function toAnchor(a: string | undefined, paraText: (pid: string) => string): string | undefined {
  if (!a) return undefined;
  const [pid, phrase] = a.split('|');
  const start = paraText(pid).indexOf(phrase);
  return start < 0 ? `${pid}:0-0` : `${pid}:${start}-${start + phrase.length}`;
}

/** Simple SVG as a data URL — mock images never touch the network. */
export function svgData(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
