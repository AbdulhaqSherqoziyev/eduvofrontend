/**
 * One item's recording (spec §1.0 pre-roll): MediaRecorder starts when 3-2-1 begins. If no speech
 * is heard during the countdown, that pre-roll is thrown away by restarting the recorder at "go"
 * (a WebM can't be trimmed without re-encoding); if speech started early it is kept.
 * Every 1 s chunk is written to IndexedDB (`partial`) — a reload or a crash keeps the answer.
 */
import { putRec, recId, type RecRow } from './idb';
import { newRecorder, type Meter } from './recorder';

const VAD_DB = -45;

export class ItemRecorder {
  private rec: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private speech = false;
  private vad: number | null = null;
  private t0 = 0;
  private startedAt = 0;
  private stopping: Promise<RecRow> | null = null;

  constructor(private stream: MediaStream, private m: Meter, private ids: { attemptId: string; stageKey: string; itemKey: string }) {}

  private row(state: RecRow['state'], backup = false): RecRow {
    const { attemptId, stageKey, itemKey } = this.ids;
    return { id: recId(attemptId, itemKey, backup), attemptId, stageKey, itemKey, chunks: [...this.chunks], mime: this.rec?.mimeType || 'audio/webm',
      durationMs: this.startedAt ? performance.now() - this.startedAt : 0, state, backup, updatedAt: Date.now() };
  }

  private begin() {
    this.chunks = [];
    const r = newRecorder(this.stream);
    r.ondataavailable = (e) => {
      if (!e.data.size || r !== this.rec) return;
      this.chunks.push(e.data);
      if (!this.stopping) void putRec(this.row('partial'));
    };
    this.rec = r;
    this.startedAt = performance.now();
    r.start(1000);
  }

  /** 3-2-1 begins: start recording and listen for early speech. */
  preRoll() {
    this.speech = false;
    this.begin();
    this.vad = window.setInterval(() => { if (this.m.db() > VAD_DB) this.speech = true; }, 50);
  }

  /** Countdown ended: the answer clock starts now. Drops a silent pre-roll. */
  go() {
    if (this.vad != null) { window.clearInterval(this.vad); this.vad = null; }
    if (!this.speech && this.rec) {
      const old = this.rec;
      this.rec = null;
      old.ondataavailable = null;
      try { old.stop(); } catch { /* already stopped */ }
      this.begin();
    }
    this.t0 = performance.now();
  }

  /** Seconds of answer since "go" (pre-roll not counted — spec §1.0). */
  elapsed() { return this.t0 ? (performance.now() - this.t0) / 1000 : 0; }

  /** Repeat pressed during the countdown: nothing of this take is kept. */
  cancel() {
    if (this.vad != null) window.clearInterval(this.vad);
    const r = this.rec;
    this.rec = null;
    if (r) { r.ondataavailable = null; try { r.stop(); } catch { /* ignore */ } }
    this.chunks = [];
  }

  /**
   * Stop and return the row. `state: 'final'` → the answer; `backup: true` → a partial kept on the
   * device from before an interruption. Track already ended (mic lost) → whatever was saved so far.
   */
  stop(state: RecRow['state'] = 'final', backup = false): Promise<RecRow> {
    if (this.stopping) return this.stopping;
    if (this.vad != null) window.clearInterval(this.vad);
    const r = this.rec;
    this.stopping = new Promise<RecRow>((res) => {
      const done = async () => { const row = this.row(state, backup); await putRec(row); res(row); };
      if (!r || r.state === 'inactive') { void done(); return; }
      r.onstop = () => void done();
      try { r.stop(); } catch { void done(); }
    });
    return this.stopping;
  }
}
