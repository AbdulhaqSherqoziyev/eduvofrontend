'use client';
/**
 * 132×76 picture of the browser's microphone prompt (spec §1.1-a): address bar with a lock, a small
 * "Use your microphone?" pop-up under it, "Allow" framed in accent. English like the browser; aria-hidden —
 * the meaning is repeated in `precheck.mic_permission_where`.
 */
export function MicPermissionHint() {
  return (
    <svg width={132} height={76} viewBox="0 0 132 76" aria-hidden style={{ flexShrink: 0, background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 8 }}>
      <rect x={6} y={6} width={120} height={12} rx={6} fill="var(--x-tile)" />
      <rect x={11} y={10} width={4} height={4} rx={1} fill="var(--x-muted)" />
      <path d="M12 10 v-1.2 a1 1 0 0 1 2 0 V10" stroke="var(--x-muted)" strokeWidth={0.8} fill="none" />
      <rect x={20} y={11} width={60} height={2} rx={1} fill="var(--x-line)" />
      <rect x={8} y={22} width={86} height={48} rx={6} fill="var(--x-panel)" stroke="var(--x-line)" />
      <text x={14} y={36} fontSize={7.5} fontWeight={700} fill="var(--x-ink)" fontFamily="sans-serif">Use your microphone?</text>
      <rect x={14} y={48} width={34} height={14} rx={4} fill="none" stroke="var(--x-accent)" strokeWidth={2} />
      <text x={22} y={58} fontSize={7.5} fontWeight={700} fill="var(--x-accent)" fontFamily="sans-serif">Allow</text>
      <rect x={52} y={48} width={34} height={14} rx={4} fill="var(--x-tile)" />
      <text x={60} y={58} fontSize={7.5} fontWeight={600} fill="var(--x-muted)" fontFamily="sans-serif">Block</text>
    </svg>
  );
}
