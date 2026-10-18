/** KPI card (Admin Components.dc.html · KPI KARTA; Admin Dashboard.dc.html). */
export function KpiCard({ label, value, delta, trend = 'flat', note }: {
  label: string;
  value: React.ReactNode;
  /** e.g. "+8%" / "−0.2 pp" */
  delta?: string;
  trend?: 'up' | 'down' | 'flat';
  /** secondary text after the delta (e.g. "+ $1 204.60") */
  note?: React.ReactNode;
}) {
  return (
    <div className="ma-kpi">
      <span className="ma-kpi-label">{label}</span>
      <span className="ma-kpi-value">{value}</span>
      {(delta || note) && (
        <div className="ma-kpi-foot">
          {delta && <span className={`is-${trend}`}>{delta}</span>}
          {note && <span className="ma-kpi-note">{note}</span>}
        </div>
      )}
    </div>
  );
}

export function KpiGrid({ children }: { children: React.ReactNode }) {
  return <div className="ma-kpi-grid">{children}</div>;
}
