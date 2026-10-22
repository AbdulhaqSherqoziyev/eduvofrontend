/** §2.6 footer: cookie-less note (or "from the database" on Imtihonlar / To'lov), Tashkent time, bots, opt-out link. */
import { groupNum } from '@/lib/admin-mock/format';
import { mutedText, Note } from './blocks';
import { T } from './texts';

export function AnalyticsFooter({ kind, botFiltered }: { kind: 'tracker' | 'now' | 'db'; botFiltered?: number | null }) {
  const bots = kind === 'tracker' && typeof botFiltered === 'number' ? (botFiltered > 0 ? T.foot.bots(groupNum(botFiltered)) : T.foot.noBots) : null;
  return (
    <footer style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 4 }}>
      <Note>{kind === 'db' ? T.foot.dbOnly : T.foot.cookieless}</Note>
      <p style={{ ...mutedText, margin: 0, paddingLeft: 22, lineHeight: 1.5 }}>
        {T.foot.tz}
        {bots && <> · {bots}</>}
        {' · '}
        <a href="https://mock.eduvo.uz/?_an=off" target="_blank" rel="noopener noreferrer" title={T.foot.optOutHint} style={{ fontWeight: 700 }}>{T.foot.optOut}</a>
      </p>
    </footer>
  );
}
