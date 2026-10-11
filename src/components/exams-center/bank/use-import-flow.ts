'use client';

import { useState } from 'react';
import { useBankImport, useBankPublish } from '@/lib/hooks/use-center-exams-v3';
import type { ImportCheck, ImportResult } from '@/lib/api/center-exams-v3';
import { examErrorBody, examErrorText } from '../exam-errors';

/** 422 (import) / 409 TEST_INVALID (publish) carry the check list in the error body. */
function checksFromError(e: unknown, fileName: string): ImportResult | null {
  const body = examErrorBody(e).body as Partial<ImportResult> & { checks?: ImportCheck[] };
  if (!Array.isArray(body.checks)) return null;
  const errors = body.errors ?? body.checks.filter((c) => c.level === 'err').length;
  return { fileName: body.fileName ?? fileName, errors, checks: body.checks, testId: body.testId };
}

/**
 * Centre test import: pick files → dry-run check list → "Nashr qilish" =
 * real import (POST /exams/bank/import) + publish of the created test.
 */
export function useImportFlow() {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState<string | null>(null);
  const imp = useBankImport();
  const pub = useBankPublish();
  const testFile = files.find((f) => /\.(json|xlsx|xls)$/i.test(f.name));
  const name = testFile?.name ?? files[0]?.name ?? '';

  const fail = (e: unknown, fallback: string) => {
    const r = checksFromError(e, name);
    if (r) setResult(r);
    else setError(examErrorText(e, fallback));
  };

  const check = (list: File[] = files) => {
    if (!list.length) return;
    setError(null);
    setPublished(null);
    imp.mutate({ files: list, dryRun: true }, {
      onSuccess: setResult,
      onError: (e) => fail(e, "Faylni tekshirib bo'lmadi."),
    });
  };

  const pick = (list: File[]) => {
    if (!list.length) return;
    setFiles(list);
    setResult(null);
    check(list);
  };

  const publish = () => {
    setError(null);
    imp.mutate({ files, dryRun: false }, {
      onSuccess: (r) => {
        setResult(r);
        if (!r.testId) return;
        pub.mutate(r.testId, {
          onSuccess: () => { setPublished(r.fileName); setFiles([]); },
          onError: (e) => fail(e, "Testni nashr qilib bo'lmadi."),
        });
      },
      onError: (e) => fail(e, "Testni import qilib bo'lmadi."),
    });
  };

  const busy = imp.isPending || pub.isPending;
  const canPublish = !!result && result.errors === 0 && !!testFile && !busy && !published;
  return { files, testFile, name, result, error, published, busy, pick, check: () => check(), publish, canPublish };
}

export type ImportFlow = ReturnType<typeof useImportFlow>;
