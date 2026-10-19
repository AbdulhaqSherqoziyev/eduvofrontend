/**
 * Owner analytics — API types. Copied verbatim from the API contract §1
 * (.claude/specs/analytics/api-contract.md, v0.4); backend twin: backend/src/modules/analytics/analytics.types.ts.
 * Keep in sync with the contract — do not edit shapes here alone.
 */
// ================================================================ asosiy
export type AnalyticsSite = 'landing' | 'mock' | 'erp';
export type AnalyticsSiteOrAll = AnalyticsSite | 'all';
export type WebSite = 'landing' | 'mock';
export type IsoDate = string;     // 'YYYY-MM-DD', Toshkent kuni
export type IsoInstant = string;  // UTC ISO

export type NullReason = 'retention' | 'not_tracking' | 'no_data' | 'db_error' | 'forbidden';

export interface Metric {
  cur: number | null;
  prev: number | null;
  curReason?: NullReason;   // faqat cur === null bo'lsa
  prevReason?: NullReason;  // faqat prev === null bo'lsa
  /** v0.4: when present, the delta is computed as compareCur vs prev (NOT cur vs prev).
   *  Only erpActiveCenters sets it, for ranges > 1 day ending today: completed days only (from … yesterday). */
  compareCur?: number | null;
}

export interface PeriodInfo {
  from: IsoDate;
  to: IsoDate;
  days: number;
  today: IsoDate;             // serverdagi Toshkent "bugun" — FE `max` uchun shu qiymatni ishlatadi
  partialToday: boolean;      // to === today
  cutoff: IsoInstant;         // joriy davr qayergacha sanaldi
  prev: { from: IsoDate; to: IsoDate; cutoff: IsoInstant };
  retentionLimited: boolean;
  prevRetentionLimited: boolean;
  tz: 'Asia/Tashkent';
}

export interface AnalyticsQuery {
  site: AnalyticsSiteOrAll;
  from?: IsoDate;             // default: to − 6 (7 kun)
  to?: IsoDate;               // default: today
}

export interface Paged<T> {
  rows: T[];
  total: number;              // filtr bo'yicha jami qatorlar soni ("Hammasini ko'rish" faqat total > 5 bo'lsa)
  nextCursor: string | null;  // "Ko'proq" — keyingi sahifa; null = oxiri
}

/** Umumiy "nom + odamlar + ulush" qatori (Auditoriya, Top-5 manba). */
export interface TopRow {
  key: string;                // barqaror kalit (§6)
  label: string | null;       // tayyor UI nomi; null = FE o'zi xaritalaydi (sayt tili, yo'llar)
  people: number;
  share: number;              // 0..1, people / jami people (shu ro'yxat bo'yicha)
}

export interface TopList {
  rows: TopRow[];             // ≤ 5
  total: number;              // jami qatorlar
  totalPeople: number;
}

export interface ModuleRef { key: string; label: string }

// ================================================================ meta / status
export interface MetaResponse {
  period: PeriodInfo;
  sites: Array<{
    site: AnalyticsSite;
    trackingSince: IsoDate | null;
    botFiltered: number | null;   // erp → null (footer'da ko'rsatilmaydi); forbidden → null
    forbidden?: true;
  }>;
}

export interface SiteStatus {
  site: AnalyticsSite;
  forbidden?: true;               // mock ruxsati yo'q — qolgan maydonlar null
  lastEventAt: IsoInstant | null; // botlarsiz eng oxirgi qabul qilingan hodisa
  trackingSince: IsoDate | null;  // null → "Kuzatuv hali boshlanmagan"
  silent: boolean;                // jimlik ogohlantirishi (§2 status qoidasi)
  silentHours: number | null;     // lastEventAt dan beri to'liq soatlar (matn uchun: "14 soatdan beri")
  thresholdHours: number;         // 12 | 6 | 3 (config)
  liveNow: number | null;         // tab "Hozir" nuqtasi uchun
  siteUrl: string;                // "Saytni ochish" havolasi
  clarityUrl: string | null;      // v1 doim null
}
export interface StatusResponse { serverNow: IsoInstant; sites: SiteStatus[] }

// ================================================================ overview
export interface FunnelStep {
  key: 'people' | 'signupPagePeople' | 'centersCreated' | 'signups' | 'cohortPayers';
  value: number | null;
  reason?: NullReason;
  source: 'tracker' | 'db';
  rateFromPrev: number | null;  // 0..1; 1-qadamda null; oldingi = 0 bo'lsa null
  exceedsPrev: boolean;         // value > oldingi qadam → FE "—" + (i)
}

export interface EntryTopRow { path: string; lang?: string | null; entries: number; share: number }

export interface OverviewLanding {
  site: 'landing';
  period: PeriodInfo;
  trackingSince: IsoDate | null;
  kpis: { visits: Metric; people: Metric; centersCreated: Metric; centersPaid: Metric };
  topSources: TopRow[];               // ≤5, people bo'yicha
  topSourcesTotal: number;
  topEntries: EntryTopRow[] | null;   // null = retention (spec §7.1)
  topEntriesTotal: number | null;
  funnel: FunnelStep[];               // [people, signupPagePeople, centersCreated]
  botFiltered: number;
  dbError: boolean;
}

export interface OverviewMock {
  site: 'mock';
  period: PeriodInfo;
  trackingSince: IsoDate | null;
  kpis: { visits: Metric; people: Metric; signups: Metric; paidOrders: Metric; payers: Metric };
  topSources: TopRow[];
  topSourcesTotal: number;
  topEntries: EntryTopRow[] | null;
  topEntriesTotal: number | null;
  funnel: FunnelStep[];               // [people, signups, cohortPayers]
  botFiltered: number;
  dbError: boolean;
}

export interface OverviewErp {
  site: 'erp';
  period: PeriodInfo;
  trackingSince: IsoDate | null;
  kpis: { erpActiveCenters: Metric; erpActiveUsersAvg: Metric; erpPageviews: Metric; erpErrors: Metric };
  erpTotalCenters: number | null;     // "jami N ta markazdan" (DB, davr oxiri holati)
  erpErrorCenters: number | null;     // "N ta markazda"
  topModules: Array<ModuleRef & { opens: number; share: number }>;           // ≤5
  topModulesTotal: number;
  topErrorPages: Array<{ path: string; module: ModuleRef | null; errors: number }>; // ≤5, errors>0
  topErrorPagesTotal: number;
  dbError: boolean;
}

export interface SparkPoint { d: IsoDate; v: number | null }  // null = kuzatuvdan oldin

export type SiteColumn =
  | { state: 'forbidden' }
  | { state: 'error' }
  | { state: 'not_tracking'; lastEventAt: null; trackingSince: null }
  | ({ state: 'ok'; lastEventAt: IsoInstant | null; trackingSince: IsoDate } & (
      | { site: 'landing'; people: Metric; visits: number | null; centersCreated: number | null; centersPaid: number | null; spark: SparkPoint[] }
      | { site: 'mock'; people: Metric; visits: number | null; signups: number | null; paidOrders: number | null; spark: SparkPoint[] }
      | { site: 'erp'; erpActiveUsersAvg: Metric; erpActiveCenters: number | null; erpPageviews: number | null; erpErrors: number | null; spark: SparkPoint[] }
    ));

export interface OverviewAll {
  site: 'all';
  period: PeriodInfo;
  columns: { landing: SiteColumn; mock: SiteColumn; erp: SiteColumn };
}

export type OverviewResponse = OverviewLanding | OverviewMock | OverviewErp | OverviewAll;

// ================================================================ trend
export interface TrendPointWeb {
  t: IsoInstant | IsoDate;  // hour → soat boshi (UTC ISO); day/week → IsoDate (hafta = dushanba)
  people: number | null;    // null = kuzatuvdan oldin (chiziq uziladi)
  visits: number | null;
  signups: number | null;   // landing: centersCreated; mock: signups
  paid: number | null;      // landing: centersPaid;  mock: paidOrders
}
export interface TrendWeb {
  site: WebSite;
  period: PeriodInfo;
  trackingSince: IsoDate | null;
  bucket: 'hour' | 'day' | 'week';   // hour: from = to = today; week: days > 62
  points: TrendPointWeb[];
  prevPoints: TrendPointWeb[] | null; // faqat bucket='hour': kecha 00:00 → shu soat:daqiqa
  dbError: boolean;
}
export interface TrendPointErp { t: IsoDate; activeUsers: number | null; pageviews: number | null; errors: number | null }
export interface TrendErp {
  site: 'erp';
  period: PeriodInfo;
  trackingSince: IsoDate | null;
  bucket: 'day';                      // ERP hech qachon hour/week emas
  points: TrendPointErp[];
  todayCompare: { today: number; yesterdaySameTime: number } | null; // faqat from = to = today (2 ustun)
}
export type TrendResponse = TrendWeb | TrendErp;

// ================================================================ sources
export interface SourceRowLanding {
  key: string; label: string;
  visits: number; people: number;
  signupPagePeople: number;           // "Ro'yxat sahifasini ochdi"
  medianVisitTimeSec: number | null;  // retention/no_data → null
  contactClicks: number;              // tel_click + telegram_click
  share: number;                      // people ulushi
}
export interface SourceRowMock {
  key: string; label: string;
  visits: number; people: number;
  singlePageRate: number | null;      // 0..1
  medianVisitTimeSec: number | null;
  pricingPeople: number;              // "Narxlarni ko'rdi"
  share: number;
}
export interface CampaignRow {
  campaign: string; source: string | null; medium: string | null;
  visits: number; people: number; medianVisitTimeSec: number | null;
}
export type SourcesResponse =
  | ({ site: 'landing'; view: 'source'; period: PeriodInfo; trackingSince: IsoDate | null } & Paged<SourceRowLanding>)
  | ({ site: 'mock'; view: 'source'; period: PeriodInfo; trackingSince: IsoDate | null } & Paged<SourceRowMock>)
  | ({ site: WebSite; view: 'campaign'; period: PeriodInfo; trackingSince: IsoDate | null } & Paged<CampaignRow>);

// ================================================================ pages
export interface PageRowAll {
  path: string;
  views: number; people: number;
  medianPageTimeSec: number | null;
  entries: number; exits: number;
}
export interface PageRowEntry { path: string; entries: number; singlePageRate: number | null; medianVisitTimeSec: number | null }
export interface PageRowExit  { path: string; exits: number; exitRate: number | null }   // exits / views (shu sahifa)
export interface PageRowErp {
  path: string; module: ModuleRef | null;
  opens: number; centers: number;
  medianPageTimeSec: number | null;
  errors: number;
}
export type PagesResponse =
  | ({ site: WebSite; view: 'all';   period: PeriodInfo; trackingSince: IsoDate | null; languages: string[] | null } & Paged<PageRowAll>)
  | ({ site: WebSite; view: 'entry'; period: PeriodInfo; trackingSince: IsoDate | null; languages: string[] | null } & Paged<PageRowEntry>)
  | ({ site: WebSite; view: 'exit';  period: PeriodInfo; trackingSince: IsoDate | null; languages: string[] | null } & Paged<PageRowExit>)
  | ({ site: 'erp';   view: 'all';   period: PeriodInfo; trackingSince: IsoDate | null; sort: 'views' | 'errors' } & Paged<PageRowErp>);
// languages: faqat mock — davrda tashrif bo'lgan sayt tillari (LOCALES kalitlari), boshqalarda null

// ================================================================ funnel
export interface EventRow {
  key: string;                 // §4.4 ro'yxati, tartib qat'iy
  count: number | null;
  people: number | null;
  topPage: string | null;      // "Eng ko'p qaysi sahifada" (normallashgan yo'l)
  topPageReason?: NullReason;
}
export interface FunnelResponse {
  site: WebSite;
  period: PeriodInfo;
  trackingSince: IsoDate | null;
  steps: FunnelStep[];         // landing: people → signupPagePeople → centersCreated
                               // mock:    people → signups → cohortPayers
  branch: null | {             // faqat mock
    key: 'cohortFreeStarted';
    value: number | null;
    rateOfSignups: number | null;     // value / signups
    disabledWholePeriod: boolean;     // true → "Bepul bo'lim bu davrda o'chirilgan edi"
  };
  events: EventRow[];
  dbError: boolean;
}

// ================================================================ audience
export type AudienceDim = 'devices' | 'browsers' | 'os' | 'countries' | 'cities' | 'browserLanguages' | 'siteLanguages';
export interface AudienceResponse {
  site: AnalyticsSite;
  period: PeriodInfo;
  trackingSince: IsoDate | null;
  devices: TopList; browsers: TopList; os: TopList; countries: TopList; cities: TopList;
  browserLanguages: TopList | null;   // erp → null
  siteLanguages: TopList | null;      // faqat mock
}
export type AudienceDimResponse = { site: AnalyticsSite; dim: AudienceDim; period: PeriodInfo } & Paged<TopRow>;

// ================================================================ live
export interface LiveRow { key: string; label: string | null; count: number }
export interface RecentHit {
  at: IsoInstant;
  kind: 'pv' | 'ev';
  path: string;                       // normallashgan yo'l (FE sahifa nomiga xaritalaydi)
  lang: string | null;                // mock sayt tili
  event: string | null;               // kind='ev' → hodisa kaliti
  device: 'mobile' | 'desktop' | 'tablet';
  deviceLabel: string; browserLabel: string; countryLabel: string; sourceLabel: string;
}
export interface LiveWeb {
  site: WebSite;
  updatedAt: IsoInstant;
  liveNow: number;
  pages: LiveRow[];      // ≤5 (key = yo'l, label = null)
  sources: LiveRow[];    // ≤5
  countries: LiveRow[];  // ≤5
  recent: RecentHit[];   // oxirgi 20 (eski bo'lsa ham); identifikator/IP/hash/shahar YO'Q
}
export interface LiveErp {
  site: 'erp';
  updatedAt: IsoInstant;
  liveNow: number;
  centersCount: number;
  modules: LiveRow[];                                        // ≤5, key = modul kaliti, label = modul nomi
  centers: Array<{ tenantId: string; name: string; users: number }>; // ≤5, faqat joriy 5 daqiqa
}
export interface LiveAll {
  site: 'all';
  updatedAt: IsoInstant;
  sites: Array<{ site: AnalyticsSite; liveNow: number | null; forbidden?: true }>;
}
export type LiveResponse = LiveWeb | LiveErp | LiveAll;

// ================================================================ ERP: centers / modules
export type CentersFilter = 'active' | 'declining' | 'inactive';
export type CentersSort = 'name' | 'activeDays' | 'avgDailyUsers' | 'pageviews' | 'errors' | 'lastActiveDay';
export interface CenterRow {
  tenantId: string;
  name: string;                 // brandName ?? name
  activeDays: number;           // davrda ≥1 sahifa ochilgan kunlar
  days: number;                 // davr kunlari ("6 / 7")
  avgDailyUsers: number;        // Σ kunlik users / days, 1 kasr
  pageviews: number;
  prevPageviews: number;        // "Faolligi tushgan" asosi
  errors: number;
  lastActiveDay: IsoDate | null; // kun aniqligida, umuman oxirgi faol kun (davrdan qat'i nazar); soat YO'Q (Q11)
}
export type CentersResponse = {
  period: PeriodInfo;
  trackingSince: IsoDate | null;
  totalCenters: number;
  counts: { active: number; declining: number; inactive: number };
  /** false when the period is "today so far": the raw ERP table has no time of day (Q11), so a fair
   *  "yesterday until now" per-center comparison does not exist → the declining list is empty. */
  decliningAvailable: boolean;
  filter: CentersFilter;
} & Paged<CenterRow>;

export interface ModuleRow extends ModuleRef {
  opens: number; centers: number; avgDailyUsers: number; errors: number; share: number; // share = opens ulushi
}
export interface ModulesResponse {
  period: PeriodInfo;
  trackingSince: IsoDate | null;
  rows: ModuleRow[];            // to'liq ro'yxat, opens kamayish
  unused: ModuleRef[];          // davrda 0 ochilgan modullar
}

// ================================================================ public
export interface RegionResponse { consentRequired: boolean }

// ================================================================ xatolar
export interface AnalyticsError {
  statusCode: number;
  error: string;                 // §3 jadvalidagi kod
  message: string;
  field?: string;                // 400 da
}
