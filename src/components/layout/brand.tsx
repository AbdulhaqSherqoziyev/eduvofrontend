/** Eduvo logo lockup — brand mark (blue square + white diamond) + wordmark. */
export function Brand({ compact }: { compact?: boolean }) {
  const s = compact ? 44 : 48;
  return (
    <div className="flex items-center gap-3">
      <svg
        width={s}
        height={s}
        viewBox="0 0 64 64"
        className="flex-shrink-0"
        style={{ display: 'block' }}
        aria-label="Eduvo"
      >
        <rect width="64" height="64" rx="16" fill="#3D7BF0" />
        <rect x="20" y="20" width="24" height="24" rx="7" transform="rotate(45 32 32)" fill="#fff" />
      </svg>
      <div>
        <div className="text-[18px] font-extrabold leading-none tracking-[-0.4px] text-foreground">Eduvo</div>
        <div className="mt-[3px] text-[10.5px] font-semibold text-muted">ERP</div>
      </div>
    </div>
  );
}
