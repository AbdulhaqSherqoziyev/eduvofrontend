import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ownerMockApi, type LearnersQuery, type OrdersQuery } from '../api/owner-mock';
import type { KeysetPage, MockPromoInput } from '../types/owner-mock';

/** All owner-mock queries share this root key, so one invalidation refreshes lists and details. */
const ROOT = 'owner-mock';
const keyset = <T,>(fetch: (cursor?: string) => Promise<KeysetPage<T>>) => ({
  queryFn: ({ pageParam }: { pageParam: string | undefined }) => fetch(pageParam),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (last: KeysetPage<T>) => last.nextCursor ?? undefined,
});

export function useMockOrders(p: Omit<OrdersQuery, 'cursor'>) {
  return useInfiniteQuery({ queryKey: [ROOT, 'orders', p], ...keyset((cursor) => ownerMockApi.orders({ ...p, cursor })) });
}
export function useMockOrder(id: string) {
  return useQuery({ queryKey: [ROOT, 'order', id], queryFn: () => ownerMockApi.order(id) });
}
export function useMockLearners(p: Omit<LearnersQuery, 'cursor'>) {
  return useInfiniteQuery({ queryKey: [ROOT, 'learners', p], ...keyset((cursor) => ownerMockApi.learners({ ...p, cursor })) });
}
export function useMockLearner(id: string) {
  return useQuery({ queryKey: [ROOT, 'learner', id], queryFn: () => ownerMockApi.learner(id) });
}
export function useMockPromos() {
  return useQuery({ queryKey: [ROOT, 'promos'], queryFn: () => ownerMockApi.promos() });
}
export function useMockTickets(status: string) {
  return useInfiniteQuery({ queryKey: [ROOT, 'tickets', status], ...keyset((cursor) => ownerMockApi.tickets({ status: status || undefined, cursor })) });
}
export function useMockStats(from: string, to: string) {
  return useQuery({ queryKey: [ROOT, 'stats', from, to], queryFn: () => ownerMockApi.stats({ from, to }), placeholderData: (prev) => prev });
}
export function useMockAlerts() {
  return useInfiniteQuery({ queryKey: [ROOT, 'alerts'], ...keyset((cursor) => ownerMockApi.actions({ kind: 'alert', cursor, limit: 30 })) });
}

/** Mutation that refreshes every owner-mock query on success. */
function useMockMutation<A, R>(fn: (a: A) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: [ROOT] }) });
}

export const useMarkPaid = (id: string) => useMockMutation((b: { note?: string; providerRef?: string; amountMinor?: number }) => ownerMockApi.markPaid(id, b));
export const useMarkFailed = (id: string) => useMockMutation((b: { failureCode: 'DECLINED' | 'EXPIRED'; note?: string }) => ownerMockApi.markFailed(id, b));
export const useRefund = (id: string) => useMockMutation((note: string) => ownerMockApi.refund(id, note));
export const useGrant = (id: string) => useMockMutation((b: Parameters<typeof ownerMockApi.grant>[1]) => ownerMockApi.grant(id, b));
export const useRevoke = (id: string) => useMockMutation((b: Parameters<typeof ownerMockApi.revoke>[1]) => ownerMockApi.revoke(id, b));
export const useLock = (id: string, unlock: boolean) => useMockMutation((reason: string) => (unlock ? ownerMockApi.unlock(id, reason) : ownerMockApi.lock(id, reason)));
export const useSavePromo = (id?: string) => useMockMutation((b: MockPromoInput) => (id ? ownerMockApi.updatePromo(id, b) : ownerMockApi.createPromo(b)));
export const useTogglePromo = () => useMockMutation((a: { id: string; isActive: boolean }) => ownerMockApi.updatePromo(a.id, { isActive: a.isActive }));
export const useTicketStatus = () => useMockMutation((a: { id: string; status: 'OPEN' | 'CLOSED' }) => ownerMockApi.updateTicket(a.id, a.status));
