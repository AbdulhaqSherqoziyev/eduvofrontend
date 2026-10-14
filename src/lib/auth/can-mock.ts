import type { SessionUser } from './types';

/** Backend guard: platform permission `mock.manage` (OWNER role has every permission). */
export const canManageMock = (u: SessionUser | null | undefined) => !!u?.isPlatform && (!!u.isOwner || (u.permissions ?? []).includes('mock.manage'));
