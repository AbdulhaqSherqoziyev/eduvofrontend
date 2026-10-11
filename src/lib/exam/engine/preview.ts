import type { AttemptState } from '../types';

/**
 * Staff preview (contract 1.4): the attempt may close any stage before its timer.
 * `isPreview` is live today; Bekzod is adding the explicit `previewEarlyFinish`
 * flag in parallel — either one turns the "Finish module (preview)" control on.
 * A student attempt (`isPreview: false`) never gets it.
 */
export function canPreviewFinish(attempt: AttemptState['attempt'] | null | undefined): boolean {
  return attempt?.isPreview === true || attempt?.previewEarlyFinish === true;
}
