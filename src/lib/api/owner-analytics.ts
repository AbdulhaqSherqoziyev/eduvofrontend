import { api } from './client';
import { cleanParams } from './http';
import type {
  AnalyticsQuery, AnalyticsSite, AnalyticsSiteOrAll, AudienceDim, AudienceDimResponse, AudienceResponse,
  CentersFilter, CentersResponse, CentersSort, FunnelResponse, IsoDate, LiveResponse, MetaResponse,
  ModulesResponse, OverviewResponse, PagesResponse, SourcesResponse, StatusResponse, TrendResponse, WebSite,
} from './owner-analytics.types';

const B = '/platform/analytics';
const get = <T,>(path: string, params: object) => api.get<T>(`${B}${path}`, { params: cleanParams(params) }).then((r) => r.data);

export interface SourcesQuery extends AnalyticsQuery { site: WebSite; view?: 'source' | 'campaign'; limit?: number; cursor?: string }
export interface PagesQuery extends AnalyticsQuery { site: AnalyticsSite; view?: 'all' | 'entry' | 'exit'; sort?: 'views' | 'errors'; lang?: string; limit?: number; cursor?: string }
export interface CentersQuery { from?: IsoDate; to?: IsoDate; filter?: CentersFilter; sort?: CentersSort; order?: 'asc' | 'desc'; limit?: number; cursor?: string }

/** Owner panel "Analitika" — platform JWT, permission `analytics.read` (contract §2). */
export const ownerAnalyticsApi = {
  meta: (q: AnalyticsQuery) => get<MetaResponse>('/meta', q),
  status: (site: AnalyticsSiteOrAll) => get<StatusResponse>('/status', { site }),
  overview: (q: AnalyticsQuery) => get<OverviewResponse>('/overview', q),
  trend: (q: AnalyticsQuery) => get<TrendResponse>('/trend', q),
  sources: (q: SourcesQuery) => get<SourcesResponse>('/sources', q),
  pages: (q: PagesQuery) => get<PagesResponse>('/pages', q),
  funnel: (q: AnalyticsQuery & { site: WebSite }) => get<FunnelResponse>('/funnel', q),
  audience: (q: AnalyticsQuery & { site: AnalyticsSite }) => get<AudienceResponse>('/audience', q),
  audienceDim: (dim: AudienceDim, q: AnalyticsQuery & { site: AnalyticsSite; limit?: number; cursor?: string }) =>
    get<AudienceDimResponse>(`/audience/${dim}`, q),
  live: (site: AnalyticsSiteOrAll) => get<LiveResponse>('/live', { site }),
  centers: (q: CentersQuery) => get<CentersResponse>('/centers', q),
  modules: (q: { from?: IsoDate; to?: IsoDate }) => get<ModulesResponse>('/modules', q),
};
