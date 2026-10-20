/**
 * SPR entry rules (spr.ts): run with `npm run test:unit`.
 * A character that can't be entered is reported, never swallowed into a different number.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applySprInput, sanitizeSpr, sanitizeSprDetailed, sprLatex } from './spr';

test('accepted values pass unchanged', () => {
  for (const v of ['7/2', '3.5', '-1/3', '.6667', '-.3333', '0.667', '1200', '50', '-0.333']) {
    assert.deepEqual(sanitizeSprDetailed(v), { value: v, rejected: null }, v);
  }
});

test('mixed number with a space is reported, not read as 31/2', () => {
  assert.deepEqual(sanitizeSprDetailed('3 1/2'), { value: '31/2', rejected: 'space' });
  assert.deepEqual(applySprInput('', '3 1/2'), { value: '', rejected: 'space' });
  assert.deepEqual(applySprInput('3', '3 '), { value: '3', rejected: 'space' });
});

test('decimal comma is reported, not read as 05', () => {
  assert.equal(sanitizeSprDetailed('0,5').rejected, 'comma');
  assert.deepEqual(applySprInput('0', '0,'), { value: '0', rejected: 'comma' });
  assert.deepEqual(applySprInput('', '1,200'), { value: '', rejected: 'comma' });
});

test('% and $ are reported as symbols', () => {
  assert.deepEqual(applySprInput('50', '50%'), { value: '50', rejected: 'symbol' });
  assert.deepEqual(applySprInput('', '$25'), { value: '', rejected: 'symbol' });
});

test('letters, a second point/bar, a late minus and the length limit are "other"', () => {
  assert.equal(sanitizeSprDetailed('x').rejected, 'other');
  assert.equal(sanitizeSprDetailed('1.2.').rejected, 'other');
  assert.equal(sanitizeSprDetailed('1/2/').rejected, 'other');
  assert.equal(sanitizeSprDetailed('1/2.').rejected, 'other');
  assert.equal(sanitizeSprDetailed('5-').rejected, 'other');
  assert.equal(sanitizeSprDetailed('−1/3').rejected, 'other'); // U+2212, not the keyboard minus
  assert.deepEqual(applySprInput('12345', '123456'), { value: '12345', rejected: 'other' });
  assert.deepEqual(applySprInput('-12345', '-123456'), { value: '-12345', rejected: 'other' });
});

test('paste goes through the same path: valid pastes land, invalid ones keep the field', () => {
  assert.deepEqual(applySprInput('', '-1/3'), { value: '-1/3', rejected: null });
  assert.deepEqual(applySprInput('', '.6667'), { value: '.6667', rejected: null });
  assert.deepEqual(applySprInput('7', '.666667'), { value: '7', rejected: 'other' });
  assert.deepEqual(applySprInput('', '3 1/2'), { value: '', rejected: 'space' });
});

test('deleting characters is never rejected', () => {
  assert.deepEqual(applySprInput('-1/3', '-1/'), { value: '-1/', rejected: null });
  assert.deepEqual(applySprInput('5', ''), { value: '', rejected: null });
});

test('sanitizeSpr keeps its old filtering contract', () => {
  assert.equal(sanitizeSpr('3 1/2'), '31/2');
  assert.equal(sanitizeSpr('0,5'), '05');
  assert.equal(sanitizeSpr('50%'), '50');
  assert.equal(sanitizeSpr('$25'), '25');
  assert.equal(sanitizeSpr('1,200'), '1200');
  assert.equal(sanitizeSpr('-1/3'), '-1/3');
  assert.equal(sanitizeSpr('.6667'), '.6667');
  assert.equal(sanitizeSpr('123456'), '12345');
});

test('sprLatex is unchanged', () => {
  assert.equal(sprLatex('7/2'), '\\dfrac{7}{2}');
  assert.equal(sprLatex('-1/3'), '-\\dfrac{1}{3}');
  assert.equal(sprLatex(''), null);
});
