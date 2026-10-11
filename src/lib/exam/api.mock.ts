/**
 * In-browser mock of contract §1 (NEXT_PUBLIC_EXAM_API_MOCK=1). Attempt ids
 * `demo-ielts*` / `demo-cefr*`; `?short=1` at first open gives short timers,
 * `?reset=1` starts over. State lives in localStorage so reload = resume.
 * The server clock runs 1.5 s ahead of the device on purpose (offset logic).
 */
import type { ExamApi, ExamResult } from './api';
import { reportSample } from './api';
import type { AnswerValue, AttemptState, StageBrief } from './types';
import { mockTest, stageMedia, type MockTest } from './mock/tests';
import { synthWav, throttledResponse } from './mock/audio';
import { scoreAttempt } from './mock/scoring';

const SKEW = 1500;
const KEY = 'eduvo_exam_mock:';
interface MockState { id: string; code: 'ielts' | 'cefr'; short: boolean; startedAt: string; stages: StageBrief[]; answers: Record<string, { value: AnswerValue; seq: number; stageKey: string }> }

const now = () => Date.now() + SKEW;
const iso = (t: number) => new Date(t).toISOString();
const testOf = (s: MockState): MockTest => mockTest(s.code, s.short);

function load(id: string): MockState {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  try {
    if (params?.get('reset') === '1' && !(window as unknown as { __mockReset?: boolean }).__mockReset) {
      (window as unknown as { __mockReset?: boolean }).__mockReset = true;
      window.localStorage.removeItem(KEY + id);
      Object.keys(window.localStorage).filter((k) => k.startsWith(`eduvo_exam:${id}:`)).forEach((k) => window.localStorage.removeItem(k));
    }
    const raw = window.localStorage.getItem(KEY + id);
    if (raw) return JSON.parse(raw) as MockState;
  } catch { /* fresh */ }
  const code = id.startsWith('demo-cefr') ? 'cefr' : 'ielts';
  const short = params?.get('short') === '1';
  const t = mockTest(code, short);
  const st: MockState = {
    id, code, short, startedAt: iso(now()), answers: {},
    stages: t.stages.map((s, i) => ({ sectionKey: s.sectionKey, stageKey: s.stageKey, kind: s.kind, order: i + 1, status: 'PENDING', startedAt: null, deadlineAt: null, lockedAt: null, audioStartedAt: null, separateSitting: false })),
  };
  save(st);
  return st;
}
function save(s: MockState) { try { window.localStorage.setItem(KEY + s.id, JSON.stringify(s)); } catch { /* ignore */ } }

/** Lazy lock, like the server's GET: deadline + 3 s grace. */
function lazyLock(s: MockState) {
  for (const st of s.stages) if (st.status === 'IN_PROGRESS' && st.deadlineAt && now() > Date.parse(st.deadlineAt) + 3000) { st.status = 'LOCKED'; st.lockedAt = st.deadlineAt; }
}

async function respond<T>(fn: () => ExamResult<T>): Promise<ExamResult<T>> {
  const offline = (typeof navigator !== 'undefined' && navigator.onLine === false) || (window as unknown as { __examMockOffline?: boolean }).__examMockOffline;
  const t0 = performance.now();
  await new Promise((r) => setTimeout(r, 60 + Math.random() * 120));
  if (offline) return { ok: false, kind: 'network' };
  const r = fn();
  if (r.ok) reportSample(t0, performance.now(), r.data);
  return r;
}
const fail = <T,>(status: number, code: string, body?: Record<string, unknown>): ExamResult<T> => ({ ok: false, kind: status >= 500 ? 'server' : 'client', status, code, body: { ...body, serverNow: iso(now()) } });

export function createMockApi(): ExamApi {
  return {
    getAttempt: (id) => respond(() => {
      const s = load(id); lazyLock(s); save(s);
      const t = testOf(s);
      const cur = s.stages.find((x) => x.status === 'IN_PROGRESS');
      const next = s.stages.find((x) => x.status === 'PENDING');
      const nextStage = next ? t.stages.find((x) => x.stageKey === next.stageKey) : null;
      const data: AttemptState = {
        attempt: { id, examCode: t.config.code, testId: `test-${s.code}`, mode: 'full', sectionKey: null, status: s.stages.every((x) => x.status === 'LOCKED') ? 'COMPLETED' : 'ACTIVE',
          isPreview: false, currentStageKey: cur?.stageKey ?? next?.stageKey ?? null, startedAt: s.startedAt, finishedAt: null, candidate: { name: 'Aziza Karimova', code: '204118' } },
        config: t.config, stages: s.stages,
        answers: Object.entries(s.answers).map(([questionId, a]) => ({ questionId, stageKey: a.stageKey, value: a.value, uiState: null, clientSeq: a.seq })),
        recordings: [], audioOffsetMs: cur?.audioStartedAt ? now() - Date.parse(cur.audioStartedAt) : null,
        preload: nextStage ? stageMedia(t, nextStage).filter((m) => m.kind === 'audio') : [], serverNow: iso(now()),
      };
      return { ok: true, data };
    }),
    startStage: (id, key) => respond(() => {
      const s = load(id); lazyLock(s);
      const st = s.stages.find((x) => x.stageKey === key);
      if (!st) return fail(404, 'STAGE_NOT_FOUND');
      if (st.status === 'LOCKED') return fail(409, 'STAGE_LOCKED');
      const open = s.stages.find((x) => x.status === 'IN_PROGRESS' && x.stageKey !== key);
      if (open) return fail(423, 'PREVIOUS_STAGE_OPEN', { openStageKey: open.stageKey });
      const expected = s.stages.find((x) => x.status !== 'LOCKED');
      if (expected && expected.stageKey !== key) return fail(409, 'STAGE_NOT_NEXT', { expectedStageKey: expected.stageKey });
      const t = testOf(s);
      const ms = t.stages.find((x) => x.stageKey === key)!;
      const cfg = t.config.sections.find((x) => x.key === st.sectionKey)!.stages[0];
      if (st.status === 'PENDING') {
        const start = now();
        let dur = (cfg.timer.duration_sec ?? 0) * 1000;
        if (cfg.timer.mode === 'audio_driven') dur = (cfg.audio?.lead_in_sec ?? 5) * 1000 + (ms.built?.audio ?? []).reduce((a, b) => a + b.durationMs, 0) + (cfg.timer.review_sec ?? 0) * 1000;
        Object.assign(st, { status: 'IN_PROGRESS', startedAt: iso(start), deadlineAt: iso(start + dur), audioStartedAt: ms.built?.audio.length ? iso(start) : null });
      }
      save(s);
      const content = ms.kind === 'writing' ? { kind: 'writing' as const, tasks: ms.tasks ?? [] } : { kind: 'questions' as const, parts: ms.built!.parts };
      return { ok: true, data: { stage: st, content, media: stageMedia(t, ms), serverNow: iso(now()) } };
    }),
    saveAnswers: (id, body) => respond(() => {
      const s = load(id);
      const st = s.stages.find((x) => x.stageKey === body.stageKey);
      if (!st || st.status === 'PENDING') return fail(409, 'STAGE_NOT_STARTED');
      if (st.status === 'LOCKED' || (st.deadlineAt && now() > Date.parse(st.deadlineAt) + 3000)) return fail(409, 'STAGE_LOCKED', { lockedAt: st.deadlineAt });
      const accepted: string[] = [];
      const rejected: { questionId: string; reason: string }[] = [];
      for (const a of body.answers) {
        const cur = s.answers[a.questionId];
        if (cur && cur.seq >= a.clientSeq) { rejected.push({ questionId: a.questionId, reason: 'STALE_SEQ' }); continue; }
        s.answers[a.questionId] = { value: a.value, seq: a.clientSeq, stageKey: body.stageKey };
        accepted.push(a.questionId);
      }
      save(s);
      return { ok: true, data: { accepted, rejected, deadlineAt: st.deadlineAt!, serverNow: iso(now()) } };
    }),
    submitStage: (id, key) => respond(() => {
      const s = load(id);
      const st = s.stages.find((x) => x.stageKey === key);
      if (!st || st.status === 'PENDING') return fail(409, 'STAGE_NOT_STARTED');
      if (st.status !== 'LOCKED') Object.assign(st, { status: 'LOCKED', lockedAt: iso(now()) });
      save(s);
      const t = testOf(s);
      const next = s.stages.find((x) => x.status === 'PENDING') ?? null;
      const nm = next ? t.stages.find((x) => x.stageKey === next.stageKey)! : null;
      return { ok: true, data: { stage: st, nextStageKey: next?.stageKey ?? null, preload: nm ? stageMedia(t, nm).filter((m) => m.kind === 'audio') : [],
        attemptStatus: next ? 'ACTIVE' : 'COMPLETED', serverNow: iso(now()) } };
    }),
    reportSkip: (_id, _key, part) => respond(() => ({ ok: true, data: { techSkippedParts: [part] } })),
    integrity: () => respond(() => ({ ok: true, data: { ok: true } })),
    result: (id) => respond(() => {
      const s = load(id); lazyLock(s);
      const locked = new Set(s.stages.filter((x) => x.status === 'LOCKED').map((x) => x.stageKey));
      if (!locked.size) return fail(409, 'ATTEMPT_NOT_FINISHED');
      return { ok: true, data: { ...scoreAttempt(testOf(s), s.answers, locked, iso(now()), Object.fromEntries(s.stages.map((x) => [x.stageKey, x.lockedAt]))), attemptId: id } };
    }),
    time: () => respond(() => ({ ok: true, data: { serverNow: iso(now()) } })),
    saveOnExit: () => undefined, // mock saves synchronously through saveAnswers
    async fetchMedia(url, signal) {
      if (!url.startsWith('mock://audio/')) return fetch(url, { signal });
      const ms = Number(new URL(url.replace('mock://', 'http://x/')).searchParams.get('ms')) || 10000;
      return throttledResponse(synthWav(ms, url.length % 7), 420_000, signal);
    },
  };
}
