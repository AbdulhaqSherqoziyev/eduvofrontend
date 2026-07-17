'use client';

import { useRef, useState } from 'react';
import { Paperclip, X } from 'lucide-react';
import { NmButton } from '@/components/ui/nm-button';
import { useUploadAssignmentFile } from '@/lib/hooks/use-assignments';

interface Props {
  value: string[];
  onChange: (ids: string[]) => void;
}

/** Multi-file uploader — uploads each file, renders chips, exposes file ids. */
export function FileAttach({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<{ id: string; name: string }[]>([]);
  const upload = useUploadAssignmentFile();

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';
    const MAX = 10 * 1024 * 1024;
    const ALLOWED = /^(image\/|application\/pdf)/;
    const added: { id: string; name: string }[] = [];
    for (const file of picked) {
      if (!ALLOWED.test(file.type)) { window.alert(`${file.name}: faqat rasm yoki PDF biriktirish mumkin`); continue; }
      if (file.size > MAX) { window.alert(`${file.name}: hajmi 10 MB dan oshmasligi kerak`); continue; }
      const res = await upload.mutateAsync(file);
      added.push({ id: res.id, name: res.name });
    }
    const next = [...files, ...added];
    setFiles(next);
    onChange(next.map((f) => f.id));
  };

  const remove = (id: string) => {
    const next = files.filter((f) => f.id !== id);
    setFiles(next);
    onChange(next.map((f) => f.id));
  };

  return (
    <div className="flex flex-col gap-2.5">
      <input ref={inputRef} type="file" multiple hidden accept="image/*,application/pdf" onChange={onPick} />
      <NmButton
        type="button"
        variant="soft"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={upload.isPending}
      >
        <Paperclip className="size-4" />
        {upload.isPending ? 'Yuklanmoqda...' : 'Fayl biriktirish'}
      </NmButton>
      {files.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {files.map((f) => (
            <span
              key={f.id}
              className="flex items-center gap-1.5 rounded-[10px] bg-background px-3 py-1.5 text-[12px] font-semibold text-[#5b6b82] shadow-nm-inset-sm"
            >
              {f.name}
              <button type="button" onClick={() => remove(f.id)} className="text-muted hover:text-danger">
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
