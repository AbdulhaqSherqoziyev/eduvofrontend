/** Answer key (green) + accepted variants (raised chips), v3 "Qabul qilinadigan variantlar" style. */
export function KeyChips({ answers, accepted }: { answers: string[]; accepted: string[] }) {
  if (!answers.length && !accepted.length) return <span className="text-[11.5px] font-bold text-danger">kalit yo&apos;q</span>;
  return (
    <span className="flex flex-wrap justify-end gap-1.5">
      {answers.map((a) => <span key={`k-${a}`} className="rounded-[8px] px-2 py-0.5 text-[12px] font-extrabold" style={{ color: '#1F7A55', background: '#E5F5EE' }}>{a}</span>)}
      {accepted.map((a) => <span key={`a-${a}`} className="rounded-[8px] px-2 py-0.5 text-[12px] font-bold text-foreground shadow-nm-sm">{a}</span>)}
    </span>
  );
}
