/**
 * Recordings on the device (IndexedDB) — every 1 s chunk lands here while recording, so a crash,
 * a reload or a dead connection never loses an answer (spec §1.6). Falls back to memory when
 * IndexedDB is unavailable (private mode): the exam still works, only reload-safety is lost.
 */
export type RecState = 'partial' | 'final' | 'uploaded' | 'dropped';
export interface RecRow {
  id: string; attemptId: string; stageKey: string; itemKey: string;
  chunks: Blob[]; mime: string; durationMs: number; state: RecState;
  /** partial kept from before an interruption (never graded unless the item could not restart). */
  backup?: boolean;
  updatedAt: number;
}

const DB = 'eduvo_speaking';
const STORE = 'recs';
const mem = new Map<string, RecRow>();
let dbp: Promise<IDBDatabase | null> | null = null;

function open(): Promise<IDBDatabase | null> {
  if (dbp) return dbp;
  dbp = new Promise((res) => {
    try {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => { r.result.createObjectStore(STORE, { keyPath: 'id' }); };
      r.onsuccess = () => res(r.result);
      r.onerror = () => res(null);
      r.onblocked = () => res(null);
    } catch { res(null); }
  });
  return dbp;
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest | void): Promise<T | null> {
  return open().then((db) => new Promise<T | null>((res) => {
    if (!db) { res(null); return; }
    try {
      const t = db.transaction(STORE, mode);
      const req = fn(t.objectStore(STORE));
      t.oncomplete = () => res(req ? (req.result as T) : null);
      t.onerror = () => res(null);
      t.onabort = () => res(null);
    } catch { res(null); }
  }));
}

export const recId = (attemptId: string, itemKey: string, backup = false) => `${attemptId}:${itemKey}${backup ? ':backup' : ''}`;

export async function putRec(row: RecRow): Promise<void> {
  mem.set(row.id, row);
  await tx('readwrite', (s) => s.put(row));
}

export async function getRec(id: string): Promise<RecRow | null> {
  return (await tx<RecRow>('readonly', (s) => s.get(id))) ?? mem.get(id) ?? null;
}

export async function listRecs(attemptId: string): Promise<RecRow[]> {
  const all = (await tx<RecRow[]>('readonly', (s) => s.getAll())) ?? [...mem.values()];
  return all.filter((r) => r.attemptId === attemptId);
}

/** Uploaded audio leaves the device (keeps only the row's state, without bytes). A backup keeps its bytes until the
 *  stage ends — if the server then refuses the restart, that partial becomes the answer (§4a). */
export async function markRec(id: string, state: RecState): Promise<void> {
  const r = await getRec(id);
  if (!r) return;
  await putRec({ ...r, state, chunks: (state === 'uploaded' || state === 'dropped') && !r.backup ? [] : r.chunks, updatedAt: Date.now() });
}
