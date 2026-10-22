/**
 * Where a (re)opened Speaking stage continues (spec §1.6, contract §3/§4a). Pure except for the
 * IndexedDB read. An item is "spent" once its recording is on the server or final on this device.
 * The item that was in progress restarts from its beginning once; the second time the partial
 * recording becomes the answer and the test moves on.
 */
import type { SpeakingStageContent } from '../speaking-types';
import { listRecs, type RecRow } from './idb';
import { speakingLocal } from './local';

export interface ResumePoint {
  /** index into `content.items` to enter */
  idx: number;
  /** answers already saved (server + device) */
  saved: number;
  /** records-items in the test */
  total: number;
  /** 1-based number of the records-item we land on */
  questionNo: number;
  /** the item that was in progress; null on a fresh start */
  interrupted: string | null;
  /** that item already used its one restart */
  used: boolean;
  /** continue from the next item (restart used AND a partial recording exists — lost-rules.afterReload) */
  next: boolean;
  /** its partial recording on this device (if any) */
  partial: RecRow | null;
}

export async function resumePoint(attemptId: string, c: SpeakingStageContent, serverRecorded: string[], serverRestarted: string[]): Promise<ResumePoint> {
  const rows = await listRecs(attemptId);
  const local = speakingLocal(attemptId);
  const spent = new Set([...serverRecorded, ...local.done, ...rows.filter((r) => !r.backup && (r.state === 'final' || r.state === 'uploaded')).map((r) => r.itemKey)]);
  const rec = c.items.filter((i) => i.records);
  const first = c.items.findIndex((i) => i.records && !spent.has(i.itemKey));
  let idx = first < 0 ? c.items.length : first;
  const cur = c.items[idx];
  const partial = cur ? rows.find((r) => !r.backup && r.itemKey === cur.itemKey && r.state === 'partial' && r.chunks.length > 0) ?? null : null;
  const interrupted = cur && (partial || local.cur === cur.itemKey) ? cur.itemKey : null;
  const used = !!interrupted && (serverRestarted.includes(interrupted) || local.restarted.includes(interrupted));
  // replay the examiner lines that introduce this part (e.g. the Part 2 instructions)
  if (!(used && partial)) while (idx > 0 && c.items[idx - 1]?.kind === 'examiner_line') idx -= 1;
  const saved = rec.filter((i) => spent.has(i.itemKey)).length;
  return { idx, saved, total: rec.length, questionNo: Math.min(rec.length, saved + 1), interrupted, used, next: used && !!partial, partial };
}
