/** Mock of speaking contract §2 (recordings upload) and §4a (item restart). */
import type { ExamResult } from '../api';
import { fail, iso, load, now, respond, save } from '../api.mock';
import type { RecordingUploadResp, RestartResp } from '../speaking-types';
import { mockTest } from './tests';

export const mockSpeakingAttempt = (id: string) => id.startsWith('demo-ielts-sp');

function speakingItem(code: 'ielts' | 'cefr', short: boolean, itemKey: string) {
  return mockTest(code, short).stages.find((x) => x.kind === 'speaking')?.speaking?.items.find((i) => i.itemKey === itemKey) ?? null;
}

export function mockUpload(id: string, b: { file: Blob; stageKey: string; itemKey: string; durationMs: number }): Promise<ExamResult<RecordingUploadResp>> {
  return respond(() => {
    const s = load(id);
    const st = s.stages.find((x) => x.stageKey === b.stageKey);
    if (!st || st.status === 'PENDING') return fail(409, 'STAGE_NOT_STARTED');
    if (st.status === 'LOCKED' && st.lockedAt && now() > Date.parse(st.lockedAt) + 15_000) return fail(409, 'STAGE_LOCKED');
    const item = speakingItem(s.code, s.short, b.itemKey);
    if (!item || !item.records) return fail(400, 'UNKNOWN_ITEM');
    if (b.file.size > 5 * 1024 * 1024) return fail(413, 'FILE_TOO_LARGE');
    s.recs = s.recs ?? {};
    if (s.recs[b.itemKey] != null) return fail(409, 'ALREADY_RECORDED');
    s.recs[b.itemKey] = Math.round(b.durationMs);
    save(s);
    return { ok: true, data: { recordingId: `rec-${b.itemKey}`, itemKey: b.itemKey, status: 'UPLOADED', serverNow: iso(now()) } };
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
