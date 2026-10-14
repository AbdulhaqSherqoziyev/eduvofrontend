/**
 * Neutral payment-method icons for Checkout (README "Assets": provider logos are not supplied, so
 * no brand marks are drawn — Lucide shapes in the design's inset tile). Card = card, Wallet =
 * wallet (Apple Pay / Google Pay show their own marks inside Paddle), Local transfer = bank.
 */
import { CreditCard, Landmark, Wallet } from 'lucide-react';

export type PayIconKind = 'card' | 'wallet' | 'local';
const ICON = { card: CreditCard, wallet: Wallet, local: Landmark } as const;

/** 40×28 inset tile (phone rows) or a bare 22px icon (desktop tiles). */
export function PayIcon({ kind, tile = true, dim = false }: { kind: PayIconKind; tile?: boolean; dim?: boolean }) {
  const I = ICON[kind];
  const icon = <I size={tile ? 18 : 22} strokeWidth={2} aria-hidden style={{ color: 'var(--blue)' }} />;
  if (!tile) return icon;
  return (
    <span aria-hidden style={{ width: 40, height: 28, borderRadius: 7, flex: 'none', boxShadow: 'var(--inset)', display: 'grid', placeItems: 'center', opacity: dim ? 0.55 : 1 }}>{icon}</span>
  );
}
