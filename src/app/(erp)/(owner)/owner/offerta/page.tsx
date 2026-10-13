'use client';

import { useEffect, useState } from 'react';
import { NmButton } from '@/components/ui/nm-button';
import { ownerSettingsApi } from '@/lib/api/owner-settings';

/** OWNER edits the public offerta shown on the landing page before sign-up. */
export default function OwnerOffertaPage() {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    ownerSettingsApi
      .getOfferta()
      .then((d) => { setValue(d.value); setSavedAt(d.updatedAt); })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const d = await ownerSettingsApi.setOfferta(value);
      setSavedAt(d.updatedAt);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-[24px] font-extrabold tracking-[-0.4px] text-foreground">Ommaviy oferta</h1>
        <p className="text-[14px] text-muted">
          Landing sahifada hisob ochishdan oldin ko&apos;rsatiladigan oferta matni
        </p>
      </div>
      <div className="rounded-[24px] bg-background p-6 shadow-nm">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={18}
          placeholder={loading ? 'Yuklanmoqda…' : 'Oferta matnini shu yerga yozing…'}
          className="w-full resize-y rounded-ctl bg-background p-4 text-[14px] leading-relaxed text-foreground shadow-nm-inset outline-none"
        />
        <div className="mt-4 flex items-center gap-4">
          <NmButton type="button" onClick={save} disabled={saving || loading}>
            {saving ? '...' : 'Saqlash'}
          </NmButton>
          {savedAt ? (
            <span className="text-[12px] font-medium text-muted">
              Oxirgi yangilanish: {new Date(savedAt).toLocaleString('uz-UZ')}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
