/** Mock-only scoring (the real one is Bekzod's strategy registry). */
import type { AnswerValue, ResultResp, ResultSection, ReviewRow } from '../types';
import type { MockTest } from './tests';

const norm = (s: string) => s.toLowerCase().replace(/[.,!?'"’]/g, '').replace(/\s+/g, ' ').trim();

const IELTS_BANDS: [number, number][] = [[39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [10, 4], [6, 3.5], [4, 3], [0, 2.5]];
const CEFR_LEVELS: [number, string][] = [[65, 'C1'], [51, 'B2'], [38, 'B1']];

/** Mock Writing is "graded" MOCK_GRADE_MS after the stage locks: criteria as the runner sends them (`[{name, score, max, note}]`) + its feedbackText() layout. */
const MOCK_GRADE_MS = 20_000;
const MOCK_FEEDBACK = 'Fikr aniq, lekin misollar kam.\n\nKuchli tomonlar:\n• "In my opinion, cities should invest in public transport" — pozitsiya birinchi abzatsdayoq aniq.\n\nKeyingi qadamlar:\n• "it have many benefits" — ega-kesim moslashuvi → "it has many benefits"\n• "firstly … secondly … thirdly" — bog\'lovchilar bir xil; "moreover", "in addition" qo\'shing → "Firstly … Moreover …"';
const MOCK_CRITERIA = [
  { name: 'Task Response', score: 6, max: 9, note: "Ikkala fikr muhokama qilingan, o'z pozitsiyasi aniq. Bitta aniq misol qo'shish kerak." },
  { name: 'Coherence & Cohesion', score: 6, max: 9, note: 'Paragraflar mantiqiy. Bog\'lovchilar takrorlanadi ("firstly", "secondly").' },
  { name: 'Lexical Resource', score: 6.5, max: 9, note: 'Lug\'at yetarli, lekin "many", "good" ko\'p takrorlangan.' },
  { name: 'Grammatical Range and Accuracy', score: 5.5, max: 9, note: '"it have" kabi moslashuv xatolari.' },
];

export function scoreAttempt(test: MockTest, answers: Record<string, { value: AnswerValue }>, locked: Set<string>, serverNow: string, lockedAt: Record<string, string | null> = {}): ResultResp {
  const graded = (stageKey: string) => { const at = lockedAt[stageKey]; return !!at && Date.parse(serverNow) - Date.parse(at) >= MOCK_GRADE_MS; };
  const isCefr = test.config.family === 'CEFR';
  const review: ReviewRow[] = [];
  const sections: ResultSection[] = [];
  for (const sec of test.config.sections) {
    const st = test.stages.find((s) => s.sectionKey === sec.key);
    const base = { key: sec.key, title: sec.title, techSkippedParts: [], techSkippedQuestions: 0, nextLevel: null, level: null };
    if (!st || !locked.has(st.stageKey)) { sections.push({ ...base, status: 'NOT_TAKEN', raw: null, max: null, scaled: null, label: null, estimated: false }); continue; }
    if (st.kind === 'writing') { sections.push(graded(st.stageKey) ? { ...base, status: 'READY', raw: null, max: null, scaled: 6, label: '6.0', estimated: true } : { ...base, status: 'GRADING', raw: null, max: null, scaled: null, label: null, estimated: true }); continue; }
    const keys = st.built!.keys;
    const groupHits: Record<string, number> = {};
    let raw = 0;
    const ids = Object.keys(keys).sort((a, b) => keys[a].no - keys[b].no);
    for (const id of ids) {
      const k = keys[id];
      const v = answers[id]?.value ?? null;
      let ok = false;
      if (k.type === 'mcq_multi') {
        const sel = Array.isArray(v) ? v : [];
        const gk = k.key.join(',');
        const hits = sel.filter((x) => k.key.includes(x)).length;
        const used = groupHits[gk] ?? 0;
        ok = used < hits;
        groupHits[gk] = used + 1;
      } else if (typeof v === 'string' && v.trim()) {
        ok = k.type === 'gap_fill' ? k.key.some((a) => norm(a) === norm(v)) : k.key.includes(v);
      }
      if (ok) raw++;
      review.push({ questionId: id, sectionKey: sec.key, no: k.no, type: k.type, yours: v, correct: k.key, isCorrect: ok, points: 1, explanation: k.why ?? null, passageAnchor: k.anchor ? `${k.part}/${k.anchor}` : null });
    }
    const max = ids.length;
    if (isCefr) {
      const scaled = Math.round((raw / max) * 75);
      const level = CEFR_LEVELS.find(([m]) => scaled >= m)?.[1] ?? null;
      const next = [...CEFR_LEVELS].reverse().find(([m]) => scaled < m);
      sections.push({ ...base, status: 'READY', raw, max, scaled, label: String(scaled), level, estimated: true, nextLevel: next ? { level: next[1], min: next[0] } : null });
    } else {
      const raw40 = Math.round((raw / max) * 40);
      const band = IELTS_BANDS.find(([m]) => raw40 >= m)![1];
      sections.push({ ...base, status: 'READY', raw, max, scaled: band, label: band.toFixed(1), estimated: true });
    }
  }
  const passages = test.stages.flatMap((s) => (s.built?.parts ?? []).filter((p) => p.passageHtml).map((p) => ({ sectionKey: s.sectionKey, part: p.part, title: p.title, passageHtml: p.passageHtml! })));
  const anyGrading = sections.some((s) => s.status === 'GRADING');
  return {
    attemptId: '', examCode: test.config.code, mode: 'full', status: anyGrading ? 'PARTIAL' : 'FINAL', sections,
    overall: null, // no Speaking in v1 → no overall (Aziza; _shared-decisions.md)
    certificate: isCefr ? { level: 'B1', min: 38, scaleMax: 75 } : null,
    reviewAvailableAt: serverNow, review,
    ai: test.stages.filter((s) => s.kind === 'writing' && locked.has(s.stageKey)).flatMap((s) => (s.tasks ?? []).map((tk) => (graded(s.stageKey) ? { taskKey: tk.key, status: 'READY' as const, scoreMin: 6, scoreMax: 6.5, score: 6, criteria: MOCK_CRITERIA, feedback: MOCK_FEEDBACK } : { taskKey: tk.key, status: 'GRADING' as const, scoreMin: null, scoreMax: null, score: null }))),
    examName: test.name, passages, serverNow,
  };
}
