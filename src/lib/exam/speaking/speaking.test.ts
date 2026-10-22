/** node --test (npm run test:unit): pure Speaking helpers — level verdict and the IELTS band rounding (contract §7). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { judge } from './level';
import { ieltsBand } from '../speaking-types';

test('level: silence is "quiet", never an error', () => {
  assert.equal(judge([-80, -75, -90], [0, 0, 0]), 'quiet');
  assert.equal(judge([], []), 'quiet');
});

test('level: clear speech is ok, soft speech is quiet, clipping is loud', () => {
  assert.equal(judge([-30, -28, -70, -32], [0, 0, 0, 0]), 'ok');
  assert.equal(judge([-50, -48, -55], [0, 0, 0]), 'quiet');
  assert.equal(judge([-10, -8, -9], [0.05, 0.04, 0.03]), 'loud');
});

test('band: mean of 4 criteria with IELTS rounding (x.25 → x.5, x.75 → next whole)', () => {
  assert.equal(ieltsBand([6, 6, 6, 6]), 6);
  assert.equal(ieltsBand([6, 6, 6, 7]), 6.5); // 6.25
  assert.equal(ieltsBand([6, 6, 7, 7]), 6.5); // 6.5
  assert.equal(ieltsBand([6, 7, 7, 7]), 7); // 6.75
  assert.equal(ieltsBand([5, 5, 5, 6]), 5.5); // 5.25
  assert.equal(ieltsBand([0, 0, 0, 1]), 0.5); // 0.25
});

import { afterMicLoss, afterReload } from './lost-rules';
import { staleIds } from './idb';

test('mic loss: no recording running → same question, restart not spent', () => {
  const base = { initial: false, records: true, saved: false, used: false };
  assert.equal(afterMicLoss({ ...base, recording: false }), 'same');
  assert.equal(afterMicLoss({ ...base, recording: false, used: true }), 'same');
  assert.equal(afterMicLoss({ ...base, recording: true }), 'restart');
  assert.equal(afterMicLoss({ ...base, recording: true, used: true }), 'next');
  assert.equal(afterMicLoss({ ...base, recording: true, saved: true }), 'next');
  assert.equal(afterMicLoss({ ...base, recording: true, initial: true }), 'same');
  assert.equal(afterMicLoss({ ...base, recording: true, records: false }), 'same');
});

test('reload: only a device partial spends the restart or moves on', () => {
  assert.equal(afterReload({ used: false, partial: false }), 'same');
  assert.equal(afterReload({ used: true, partial: false }), 'same');
  assert.equal(afterReload({ used: false, partial: true }), 'restart');
  assert.equal(afterReload({ used: true, partial: true }), 'next');
});

test('privacy sweep: rows untouched for more than 7 days go', () => {
  const now = Date.parse('2026-10-22T12:00:00Z');
  const day = 864e5;
  const rows = [{ id: 'a', updatedAt: now - 8 * day }, { id: 'b', updatedAt: now - 6 * day }, { id: 'c', updatedAt: now }];
  assert.deepEqual(staleIds(rows, now, 7 * day), ['a']);
});

import { classifyUpload } from './upload-rules';

test('upload answers: no endless retry on 4xx, 401 pauses, 5xx/network retry', () => {
  assert.equal(classifyUpload({ ok: true }), 'ok');
  assert.equal(classifyUpload({ ok: false, kind: 'client', status: 409, code: 'ALREADY_RECORDED' }), 'ok');
  assert.equal(classifyUpload({ ok: false, kind: 'client', status: 409, code: 'STAGE_LOCKED' }), 'drop');
  assert.equal(classifyUpload({ ok: false, kind: 'client', status: 400, code: 'UNKNOWN_ITEM' }), 'drop');
  assert.equal(classifyUpload({ ok: false, kind: 'client', status: 404 }), 'drop');
  assert.equal(classifyUpload({ ok: false, kind: 'client', status: 403, code: 'PREVIEW_ONLY' }), 'drop');
  assert.equal(classifyUpload({ ok: false, kind: 'auth', status: 401 }), 'auth');
  assert.equal(classifyUpload({ ok: false, kind: 'network' }), 'network');
  assert.equal(classifyUpload({ ok: false, kind: 'server', status: 502 }), 'server');
});

import { resultPollMs } from './poll';

test('result polling: fast while grading, slow while Speaking only waits, off when final', () => {
  assert.equal(resultPollMs({ status: 'FINAL', sections: [] }), false);
  assert.equal(resultPollMs({ status: 'PARTIAL', sections: [{ status: 'READY' }], speaking: { status: 'pending' } }), 60_000);
  assert.equal(resultPollMs({ status: 'PARTIAL', sections: [{ status: 'GRADING' }], speaking: { status: 'pending' } }), 10_000);
  assert.equal(resultPollMs({ status: 'PARTIAL', sections: [], speaking: { status: 'scoring' } }, 15_000), 15_000);
});
