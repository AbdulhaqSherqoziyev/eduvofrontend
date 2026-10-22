/**
 * Upload queue for Speaking recordings (contract §2). One worker per attempt, oldest first; each answer is
 * classified by upload-rules.ts (ok / drop / auth / network / server). Survives reloads: on boot every
 * `final` row of the attempt is queued again. `drained(ms)` lets the stage time-out wait for the last upload.
 */
import { examApi } from '../api';
import { listRecs, markRec, type RecRow } from './idb';
import { classifyUpload } from './upload-rules';

export interface QueueState { pending: number; total: number; offline: boolean; stuck: boolean; auth: boolean; /** last RECORDING_INVALID (ms) */ invalidAt: number | null }
type Listener = (s: QueueState) => void;

const queues = new Map<string, UploadQueue>();

export class UploadQueue {
  private items: RecRow[] = [];
  private running = false;
  private listeners = new Set<Listener>();
  private st: QueueState = { pending: 0, total: 0, offline: false, stuck: false, auth: false, invalidAt: null };
  private waiters = new Map<string, Array<() => void>>();
  /** v1.5: while the stage is paused nothing is sent (the server would answer 409 STAGE_PAUSED). */
  private hold = false;
  /** §2 `promptMode=audio_only` — sent with the uploads once the learner chose audio-only. */
  audioOnly = false;
  constructor(private attemptId: string, public onNet?: (ok: boolean) => void) {}

  get state() { return this.st; }
  subscribe(fn: Listener) { this.listeners.add(fn); fn(this.st); return () => { this.listeners.delete(fn); }; }
  private set(p: Partial<QueueState>) { this.st = { ...this.st, ...p }; this.listeners.forEach((l) => l(this.st)); }

  /** Re-queue everything this device still holds for the attempt (after a reload). */
  async restore() {
    if (this.st.auth) this.set({ auth: false });
    const rows = await listRecs(this.attemptId);
    for (const r of rows) if (r.state === 'final' && !this.items.some((x) => x.id === r.id)) this.items.push(r);
    this.set({ pending: this.items.length, total: Math.max(this.st.total, this.items.length) });
    void this.run();
  }

  /** Resolves when the queue is empty, or after `ms` (stage time-out: the last answer goes up before the submit). */
  drained(ms: number): Promise<boolean> {
    if (!this.items.length) return Promise.resolve(true);
    return new Promise((res) => {
      const tm = setTimeout(() => { off(); res(false); }, ms);
      const off = this.subscribe((st) => { if (st.pending === 0) { clearTimeout(tm); queueMicrotask(off); res(true); } });
    });
  }

  /** Resolves when `id` has left the queue (uploaded or dropped), or after `ms`. */
  settled(id: string, ms: number): Promise<void> {
    if (!this.items.some((x) => x.id === id)) return Promise.resolve();
    return new Promise((res) => {
      const tm = setTimeout(res, ms);
      this.waiters.set(id, [...(this.waiters.get(id) ?? []), () => { clearTimeout(tm); res(); }]);
    });
  }

  pauseUploads() { this.hold = true; }
  resumeUploads() { this.hold = false; void this.run(); }

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
    while (this.items.length && !this.hold) {
      const row = this.items[0];
      const file = new Blob(row.chunks, { type: row.mime || 'audio/webm' });
      const r = await examApi.uploadRecording(this.attemptId, { file, stageKey: row.stageKey, itemKey: row.itemKey, durationMs: row.durationMs,
        kind: row.backup ? 'backup' : 'main', ...(this.audioOnly ? { promptMode: 'audio_only' as const } : {}) });
      const v = classifyUpload(r);
      if (v === 'ok' || v === 'drop' || v === 'invalid') {
        if (v === 'invalid') this.set({ invalidAt: Date.now() });
        if (v !== 'ok') console.warn('[speaking] recording not accepted', row.itemKey, r.ok ? '' : `${r.status} ${r.code ?? ''}`);
        await markRec(row.id, v === 'ok' ? 'uploaded' : 'dropped');
        this.items.shift();
        this.waiters.get(row.id)?.forEach((w) => w());
        this.waiters.delete(row.id);
        fails = 0;
        this.onNet?.(true);
        // a locked stage can't take this recording any more — keep the "saved on this device" note visible
        this.set({ pending: this.items.length, offline: false, stuck: !r.ok && r.code === 'STAGE_LOCKED' });
        continue;
      }
      if (v === 'paused') { this.hold = true; break; } // kept; resumeUploads() after the stage resumes
      if (v === 'auth') { this.set({ auth: true }); break; } // rows stay on the device; restore() after sign-in
      if (v === 'network') {
        this.onNet?.(false);
        this.set({ offline: true });
        await waitOnline(5000);
        continue;
      }
      fails += 1;
      if (fails >= 3) this.set({ stuck: true });
      await new Promise((res) => setTimeout(res, fails >= 3 ? 30_000 : 2000));
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
