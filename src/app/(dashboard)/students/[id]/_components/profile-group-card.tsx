'use client';

import Link from 'next/link';
import { NmButton } from '@/components/ui/nm-button';
import { CustomPriceBadge } from '@/components/shared/custom-price-badge';
import { can } from '@/lib/auth/permissions';
import { formatSom } from '@/lib/utils/format';
import {
  EDIT_PRICE, FREE_LABEL, PER_MONTH, editPriceAria, groupPriceLine,
} from '@/lib/utils/price-labels';
import { MOVE_TO_GROUP } from '@/lib/utils/group-move';
import type { StudentProfileGroup } from '@/lib/types/student';

/**
 * One group on the profile (§1.2). No longer a single link: the price row
 * carries its own button, and a button inside a link is not allowed. The name
 * stays the link to the group.
 *
 * The price row exists only when the API sent `effectivePrice` — it does so for
 * `payment.read` alone, so a teacher never sees what a family pays (MUST 8).
 */
export function ProfileGroupCard({
  group: g, onEditPrice, onMove,
}: { group: StudentProfileGroup; onEditPrice: () => void; onMove: () => void }) {
  const showPrice = g.effectivePrice !== undefined;
  const canMove = can('student.update');
  // Mirrors the PATCH guard: student.update AND payment.read.
  const canEdit = showPrice && can('student.update') && can('payment.read');
  const custom = g.customPrice != null;
  const effective = g.effectivePrice ?? g.price;

  return (
    <div className="rounded-[14px] bg-background px-4 py-3 shadow-nm-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <Link href={`/groups/${g.id}`} className="group min-w-0">
          <div className="text-[13.5px] font-bold text-foreground group-hover:text-primary">{g.name}</div>
          <div className="text-[12px] font-semibold text-muted">
            {[g.subjectName, g.teacherName].filter(Boolean).join(' · ') || '—'}
          </div>
        </Link>
        <div className="text-left text-[12px] font-semibold text-muted sm:text-right">
          {[g.schedule, g.startTime].filter(Boolean).join(' · ')}
        </div>
      </div>

      {showPrice ? (
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-[rgba(122,134,153,0.16)] pt-2.5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13.5px] font-extrabold text-foreground">
                {effective === 0 ? (
                  FREE_LABEL
                ) : (
                  <>
                    {formatSom(effective)}
                    <span className="text-[12px] font-semibold text-muted">{PER_MONTH}</span>
                  </>
                )}
              </span>
              {custom ? <CustomPriceBadge /> : null}
            </div>
            {custom ? (
              <div className="text-[11.5px] font-semibold text-[#9aa6b8]">{groupPriceLine(g.price)}</div>
            ) : null}
          </div>
          {canEdit ? (
            <NmButton
              type="button"
              variant="ghost"
              size="sm"
              aria-label={editPriceAria(g.name)}
              onClick={onEditPrice}
              className="h-[36px] min-h-[44px] px-2 text-[12.5px] font-bold text-primary sm:min-h-0"
            >
              {EDIT_PRICE}
            </NmButton>
          ) : null}
        </div>
      ) : null}

      {canMove ? (
        <div className="mt-1.5 flex justify-end">
          <NmButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMove}
            className="h-[36px] min-h-[44px] px-2 text-[12.5px] font-bold text-muted hover:text-primary sm:min-h-0"
          >
            {MOVE_TO_GROUP}
          </NmButton>
        </div>
      ) : null}
    </div>
  );
}
