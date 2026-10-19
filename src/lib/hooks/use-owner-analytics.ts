import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { ownerAnalyticsApi, type CentersQuery, type PagesQuery, type SourcesQuery } from '../api/owner-analytics';
import type {
  AnalyticsSite, AnalyticsSiteOrAll, AudienceDim, IsoDate, Paged, WebSite,
} from '../api/owner-analytics.types';

/** Every analytics query shares this root key. */
const ROOT = 'owner-analytics';
interface Range { from: IsoDate; to: IsoDate }

/** Filter change keeps the old numbers on screen (spec §3.1) — no skeleton flash. */
const keep = { placeholderData: keepPreviousData } as const;
/** 4xx are answers, not hiccups: retrying a 400/403 only delays the message. */
const retry = (n: number, e: unknown) => {
  const s = (e as { response?: { status?: number } })?.response?.status ?? 0;
  return s >= 400 && s < 500 ? false : n < 1;
};

const paged = <R extends Pick<Paged<unknown>, 'nextCursor'>>(fetch: (cursor?: string) => Promise<R>) => ({
  queryFn: ({ pageParam }: { pageParam: string | undefined }) => fetch(pageParam),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (last: R) => last.nextCursor ?? undefined,
});

export function useAnalyticsMeta(site: AnalyticsSiteOrAll, r: Range, enabled = true) {
  return useQuery({ queryKey: [ROOT, 'meta', site, r.from, r.to], queryFn: () => ownerAnalyticsApi.meta({ site, ...r }), enabled, retry, ...keep });
}

/** Tracker status chips — every 60 s, paused while the tab is hidden (TanStack default). */
export function useAnalyticsStatus(site: AnalyticsSiteOrAll) {
  return useQuery({ queryKey: [ROOT, 'status', site], queryFn: () => ownerAnalyticsApi.status(site), refetchInterval: 60_000, retry, ...keep });
}

export function useAnalyticsOverview(site: AnalyticsSiteOrAll, r: Range, enabled = true) {
  return useQuery({ queryKey: [ROOT, 'overview', site, r.from, r.to], queryFn: () => ownerAnalyticsApi.overview({ site, ...r }), enabled, retry, ...keep });
}

export function useAnalyticsTrend(site: AnalyticsSite, r: Range, enabled = true) {
  return useQuery({ queryKey: [ROOT, 'trend', site, r.from, r.to], queryFn: () => ownerAnalyticsApi.trend({ site, ...r }), enabled, retry, ...keep });
}

export function useAnalyticsSources(q: Omit<SourcesQuery, 'cursor'>, enabled = true) {
  return useInfiniteQuery({ queryKey: [ROOT, 'sources', q], ...paged((cursor) => ownerAnalyticsApi.sources({ ...q, cursor })), enabled, retry, ...keep });
}

export function useAnalyticsPages(q: Omit<PagesQuery, 'cursor'>, enabled = true) {
  return useInfiniteQuery({ queryKey: [ROOT, 'pages', q], ...paged((cursor) => ownerAnalyticsApi.pages({ ...q, cursor })), enabled, retry, ...keep });
}

export function useAnalyticsFunnel(site: WebSite, r: Range, enabled = true) {
  return useQuery({ queryKey: [ROOT, 'funnel', site, r.from, r.to], queryFn: () => ownerAnalyticsApi.funnel({ site, ...r }), enabled, retry, ...keep });
}

export function useAnalyticsAudience(site: AnalyticsSite, r: Range, enabled = true) {
  return useQuery({ queryKey: [ROOT, 'audience', site, r.from, r.to], queryFn: () => ownerAnalyticsApi.audience({ site, ...r }), enabled, retry, ...keep });
}

export function useAnalyticsAudienceDim(dim: AudienceDim, site: AnalyticsSite, r: Range, enabled = true) {
  return useInfiniteQuery({
    queryKey: [ROOT, 'audience-dim', dim, site, r.from, r.to],
    ...paged((cursor) => ownerAnalyticsApi.audienceDim(dim, { site, ...r, limit: 50, cursor })),
    enabled, retry,
  });
}

/** "Hozir" — every 30 s, paused in the background; numbers just swap (spec §9). */
export function useAnalyticsLive(site: AnalyticsSiteOrAll) {
  return useQuery({ queryKey: [ROOT, 'live', site], queryFn: () => ownerAnalyticsApi.live(site), refetchInterval: 30_000, retry, ...keep });
}

export function useAnalyticsCenters(q: Omit<CentersQuery, 'cursor'>, enabled = true) {
  return useInfiniteQuery({ queryKey: [ROOT, 'centers', q], ...paged((cursor) => ownerAnalyticsApi.centers({ ...q, cursor })), enabled, retry, ...keep });
}

export function useAnalyticsModules(r: Range, enabled = true) {
  return useQuery({ queryKey: [ROOT, 'modules', r.from, r.to], queryFn: () => ownerAnalyticsApi.modules(r), enabled, retry, ...keep });
}
