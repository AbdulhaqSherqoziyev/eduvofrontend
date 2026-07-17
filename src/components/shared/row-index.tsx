/** Sequential row number — the leading "#" cell shared by every data table
 *  so row numbering looks and works identically across the whole app. */
export function RowIndex({ n }: { n: number }) {
  return <div className="min-w-[20px] shrink-0 text-[13px] font-bold tabular-nums text-[#9aa6b8]">{n}</div>;
}
