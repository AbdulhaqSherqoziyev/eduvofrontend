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
