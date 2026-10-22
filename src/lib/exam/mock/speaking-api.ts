/** Mock of speaking contract v1.2 §2 (recordings upload, kind=backup, promptMode) and §4a (item restart). */
import type { ExamResult } from '../api';
import { fail, iso, load, now, respond, save } from '../api.mock';
import type { PauseResp, RecordingUploadResp, RestartResp } from '../speaking-types';
import { mockTest } from './tests';

export const mockSpeakingAttempt = (id: string) => id.startsWith('demo-ielts-sp');

function speakingItem(code: 'ielts' | 'cefr', short: boolean, itemKey: string) {
  return mockTest(code, short).stages.find((x) => x.kind === 'speaking')?.speaking?.items.find((i) => i.itemKey === itemKey) ?? null;
}

export function mockUpload(id: string, b: { file: Blob; stageKey: string; itemKey: string; durationMs: number; kind?: 'main' | 'backup'; promptMode?: 'audio_only' }): Promise<ExamResult<RecordingUploadResp>> {
  return respond(() => {
    const s = load(id);
    const st = s.stages.find((x) => x.stageKey === b.stageKey);
    if (!st || st.status === 'PENDING') return fail(409, 'STAGE_NOT_STARTED');
    if (st.status === 'LOCKED' && st.lockedAt && now() > Date.parse(st.lockedAt) + 15_000) return fail(409, 'STAGE_LOCKED');
    const item = speakingItem(s.code, s.short, b.itemKey);
    if (!item || !item.records) return fail(400, 'UNKNOWN_ITEM');
    if (b.file.size > 5 * 1024 * 1024) return fail(413, 'FILE_TOO_LARGE');
    if (b.promptMode === 'audio_only') s.audioOnly = true;
    if (b.kind === 'backup') {
      if (s.restarts?.includes(b.itemKey)) return fail(409, 'RESTART_LIMIT');
      if (s.backups?.includes(b.itemKey)) return fail(409, 'BACKUP_EXISTS');
      s.backups = [...(s.backups ?? []), b.itemKey];
      save(s);
      return { ok: true, data: { recordingId: `bak-${b.itemKey}`, itemKey: b.itemKey, kind: 'backup', status: 'UPLOADED', serverNow: iso(now()) } };
    }
    s.recs = s.recs ?? {};
    if (s.recs[b.itemKey] != null) return fail(409, 'ALREADY_RECORDED');
    s.recs[b.itemKey] = Math.round(b.durationMs);
    save(s);
    return { ok: true, data: { recordingId: `rec-${b.itemKey}`, itemKey: b.itemKey, kind: 'main', status: 'UPLOADED', serverNow: iso(now()) } };
  });
}

export function mockRestart(id: string, stageKey: string, itemKey: string): Promise<ExamResult<RestartResp>> {
  return respond(() => {
    const s = load(id);
    const st = s.stages.find((x) => x.stageKey === stageKey);
    if (!st || st.status === 'PENDING') return fail(409, 'STAGE_NOT_STARTED');
    if (st.status === 'LOCKED') return fail(409, 'STAGE_LOCKED');
    const item = speakingItem(s.code, s.short, itemKey);
    if (!item || !item.records) return fail(400, 'UNKNOWN_ITEM');
    if (s.recs?.[itemKey] != null) return fail(409, 'ALREADY_RECORDED');
    s.restarts = s.restarts ?? [];
    if (s.restarts.includes(itemKey)) return fail(409, 'RESTART_LIMIT');
    s.restarts.push(itemKey);
    const ext = Math.round((item.promptAudioDurationMs ?? 0) / 1000) + item.prepSec + item.responseSec + 5 + 60;
    st.deadlineAt = iso(Date.parse(st.deadlineAt ?? iso(now())) + ext * 1000);
    save(s);
    return { ok: true, data: { stage: st, itemKey, restartsLeft: 0, extendedBySec: ext, serverNow: iso(now()) } };
  });
}

/** §4b (v1.4) mock: pause pushes the deadline by the remaining budget, resume trims it to the real pause. */
const pausedAt = new Map<string, number>();
export function mockPause(id: string, stageKey: string, action: 'pause' | 'resume'): Promise<ExamResult<PauseResp>> {
  return respond(() => {
    const s = load(id);
    const st = s.stages.find((x) => x.stageKey === stageKey);
    if (!st || st.status === 'PENDING') return fail(409, 'STAGE_NOT_STARTED');
    if (st.status === 'LOCKED') return fail(409, 'STAGE_LOCKED');
    let ext = 0;
    if (action === 'pause' && !pausedAt.has(id)) pausedAt.set(id, now());
    if (action === 'resume' && pausedAt.has(id)) {
      ext = Math.round((now() - pausedAt.get(id)!) / 1000);
      pausedAt.delete(id);
      st.deadlineAt = iso(Date.parse(st.deadlineAt ?? iso(now())) + ext * 1000);
      save(s);
    }
    return { ok: true, data: { stage: st, paused: pausedAt.has(id), extendedBySec: ext, pauseBudgetLeftSec: 600, serverNow: iso(now()) } };
  });
}
