/**
 * Upload queue for Speaking recordings (contract §2). One worker per attempt, oldest first.
 * - success / 409 ALREADY_RECORDED → uploaded (bytes leave the device);
 * - 409 STAGE_LOCKED / STAGE_NOT_STARTED, 400 UNKNOWN_ITEM, 413, 415 → dropped (retrying can't help);
 * - backups (`kind=backup`, contract v1.2): 409 BACKUP_EXISTS / RESTART_LIMIT → dropped;
 * - network → waits for `online` (or 5 s) and retries; server errors → after 3 tries waits 30 s (spec §1.6).
 * Survives reloads: on boot every `final` row of the attempt is queued again.
 */
import { examApi } from '../api';
import { listRecs, markRec, type RecRow } from './idb';

export interface QueueState { pending: number; total: number; offline: boolean; stuck: boolean }
type Listener = (s: QueueState) => void;

const DROP = new Set(['STAGE_LOCKED', 'STAGE_NOT_STARTED', 'UNKNOWN_ITEM', 'FILE_TOO_LARGE', 'BAD_MEDIA', 'BACKUP_EXISTS', 'RESTART_LIMIT']);
const queues = new Map<string, UploadQueue>();

export class UploadQueue {
  private items: RecRow[] = [];
  private running = false;
  private listeners = new Set<Listener>();
  private st: QueueState = { pending: 0, total: 0, offline: false, stuck: false };
  private waiters = new Map<string, Array<() => void>>();
  /** §2 `promptMode=audio_only` — sent with the uploads once the learner chose audio-only. */
  audioOnly = false;
  constructor(private attemptId: string, public onNet?: (ok: boolean) => void) {}

  get state() { return this.st; }
  subscribe(fn: Listener) { this.listeners.add(fn); fn(this.st); return () => { this.listeners.delete(fn); }; }
  private set(p: Partial<QueueState>) { this.st = { ...this.st, ...p }; this.listeners.forEach((l) => l(this.st)); }

  /** Re-queue everything this device still holds for the attempt (after a reload). */
  async restore() {
    const rows = await listRecs(this.attemptId);
    for (const r of rows) if (r.state === 'final' && !this.items.some((x) => x.id === r.id)) this.items.push(r);
    this.set({ pending: this.items.length, total: Math.max(this.st.total, this.items.length) });
    void this.run();
  }

  /** Resolves when `id` has left the queue (uploaded or dropped), or after `ms`. */
  settled(id: string, ms: number): Promise<void> {
    if (!this.items.some((x) => x.id === id)) return Promise.resolve();
    return new Promise((res) => {
      const tm = setTimeout(res, ms);
      this.waiters.set(id, [...(this.waiters.get(id) ?? []), () => { clearTimeout(tm); res(); }]);
    });
  }

  add(row: RecRow) {
    if (this.items.some((x) => x.id === row.id)) return;
    this.items.push(row);
    this.set({ pending: this.items.length, total: this.st.total + 1 });
    void this.run();
  }

  private async run() {
    if (this.running) return;
    this.running = true;
    let fails = 0;
    while (this.items.length) {
      const row = this.items[0];
      const file = new Blob(row.chunks, { type: row.mime || 'audio/webm' });
      const r = await examApi.uploadRecording(this.attemptId, { file, stageKey: row.stageKey, itemKey: row.itemKey, durationMs: row.durationMs,
        kind: row.backup ? 'backup' : 'main', ...(this.audioOnly ? { promptMode: 'audio_only' as const } : {}) });
      if (r.ok || r.code === 'ALREADY_RECORDED' || (r.code && DROP.has(r.code))) {
        await markRec(row.id, r.ok || r.code === 'ALREADY_RECORDED' ? 'uploaded' : 'dropped');
        this.items.shift();
        this.waiters.get(row.id)?.forEach((w) => w());
        this.waiters.delete(row.id);
        fails = 0;
        this.onNet?.(true);
        this.set({ pending: this.items.length, offline: false, stuck: false });
        continue;
      }
      if (r.kind === 'network') {
        this.onNet?.(false);
        this.set({ offline: true });
        await waitOnline(5000);
        continue;
      }
      fails += 1;
      if (fails >= 3) { this.set({ stuck: true }); await new Promise((res) => setTimeout(res, 30_000)); fails = 0; } else await new Promise((res) => setTimeout(res, 2000));
    }
    this.running = false;
  }
}

function waitOnline(ms: number): Promise<void> {
  return new Promise((res) => {
    const done = () => { window.removeEventListener('online', done); clearTimeout(tm); res(); };
    const tm = setTimeout(done, ms);
    window.addEventListener('online', done);
  });
}

export function queueFor(attemptId: string, onNet?: (ok: boolean) => void): UploadQueue {
  let q = queues.get(attemptId);
  if (!q) { q = new UploadQueue(attemptId, onNet); queues.set(attemptId, q); } else if (onNet) q.onNet = onNet;
  return q;
}
