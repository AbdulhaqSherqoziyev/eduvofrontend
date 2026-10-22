/**
 * What the upload queue does with one POST /recordings answer (contract §2) — pure, unit-tested.
 * ok      → uploaded (also 409 ALREADY_RECORDED: the server has it)
 * drop    → retrying can't help: 409 STAGE_LOCKED / STAGE_NOT_STARTED / BACKUP_EXISTS / RESTART_LIMIT,
 *           400 / 403 / 404 / 413 / 415 — logged, never silent
 * auth    → 401 (after the transport's own renewal): the queue pauses, the player asks to sign in again;
 *           the rows stay on the device and go up after the reboot
 * invalid → 422 RECORDING_INVALID (v1.4: unreadable or < 1 s): dropped, the item stays free on the server;
 *           the learner sees a blameless note (never "record again")
 * network → wait for `online`, retry
 * server  → 5xx / unknown: retry; after 3 in a row the "saved on this device" note shows (spec §1.6)
 */
export type UploadVerdict = 'ok' | 'drop' | 'invalid' | 'auth' | 'network' | 'server';

export function classifyUpload(r: { ok: boolean; kind?: string; status?: number; code?: string }): UploadVerdict {
  if (r.ok || r.code === 'ALREADY_RECORDED') return 'ok';
  if (r.code === 'RECORDING_INVALID' || r.status === 422) return 'invalid';
  if (r.kind === 'network') return 'network';
  if (r.kind === 'auth' || r.status === 401) return 'auth';
  if (r.status != null && r.status >= 400 && r.status < 500) return 'drop';
  return 'server';
}
