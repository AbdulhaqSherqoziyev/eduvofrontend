/**
 * Homework marks — the teacher-side write path of an assignment.
 * Spec: .claude/specs/homework-flow.md §A.9 (detail page), §D.3 (bulk upsert).
 */

/** What the teacher sheet shows for one student. */
export type MarkState = 'UNMARKED' | 'DONE' | 'NOT_DONE' | 'PARTIAL' | 'SUBMITTED';

/** What a client may write. `CLEAR` un-marks (§A.6 — pressing the active button again). */
export type MarkWrite = 'DONE' | 'NOT_DONE' | 'CLEAR';

export type HomeworkSource = 'PORTAL' | 'TEACHER';

export interface HomeworkMarkInput {
  studentId: string;
  state: MarkWrite;
  /** Only meaningful with `DONE`; never sent for `NOT_DONE` / `CLEAR`. */
  score?: number | null;
}

export interface SaveMarksInput {
  /** The lesson the work was collected at; omitted/null when marking from the detail page. */
  lessonId?: string | null;
  marks: HomeworkMarkInput[];
}

/** One row of the `POST /assignments/:id/marks` answer (§D.3). */
export interface HomeworkMark {
  studentId: string;
  state: MarkState;
  score: number | null;
  scoreMax: number | null;
  editedAt: string | null;
  required: boolean;
}

export interface SaveMarksResponse {
  ok: true;
  assignmentId: string;
  marks: HomeworkMark[];
  counter: { marked: number; required: number };
}

/** `PARTIAL` is never written by any surface this wave, but it reads as "done" (§A.12). */
export function isDoneState(state: MarkState): boolean {
  return state === 'DONE' || state === 'PARTIAL';
}

/** §A.9 counter: every row counts, marked = anything but UNMARKED. */
export function countMarked(rows: { state: MarkState }[]): { marked: number; total: number } {
  let marked = 0;
  for (const r of rows) if (r.state !== 'UNMARKED') marked += 1;
  return { marked, total: rows.length };
}
