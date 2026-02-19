// Types baseados nos DTOs do backend Go

// ==================== AUTH ====================
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  language?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expires_at: string;
  user: UserResponse;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  language?: string;
  verified: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// ==================== DASHBOARD ====================
export interface DashboardMetricsResponse {
  geo_score: number;
  geo_score_change: number;
  total_keywords: number;
  keyword_limit: number;
  total_mentions: number;
  mentions_change: number;
  average_position: number;
  position_change: number;
  platform_breakdown: PlatformBreakdownItem[];
}

export interface PlatformBreakdownItem {
  platform: string;
  score: number;
  mentions: number;
}

export interface VisibilityResponse {
  period: string;
  data_points: VisibilityPoint[];
  total: number;
  change: number;
}

export interface VisibilityPoint {
  date: string;
  visibility: number;
  mentions: number;
}

export interface RecentMention {
  id: number;
  keyword_id: number;
  keyword: string;
  platform: Platform;
  result: string;
  position?: number;
  time_ago: string;
  created_at: string;
}

export interface RecentMentionsResponse {
  mentions: RecentMention[];
  total: number;
}

export interface TopKeyword {
  id: number;
  keyword: string;
  score: number;
  score_change: number;
  trend: TrendType;
  status: string;
  mentions: number;
  visibility: number;
}

export interface TopKeywordsResponse {
  keywords: TopKeyword[];
}

export interface CompetitorComparison {
  id: number;
  name: string;
  domain: string;
  logo?: string;
  geo_score: number;
  comparison: ComparisonType;
  difference: number;
  trend_type: TrendType;
}

export interface CompetitorComparisonResponse {
  user_geo_score: number;
  competitors: CompetitorComparison[];
}

// ==================== KEYWORDS ====================
export interface CreateKeywordRequest {
  keyword: string;
  category?: string;
  platforms?: string[];
  domain_id?: number;
}

export interface UpdateKeywordRequest {
  keyword?: string;
  category?: string;
  platforms?: string[];
  auto_query?: boolean;
  domain_id?: number;
}

export interface BulkCreateKeywordsRequest {
  keywords: CreateKeywordRequest[];
}

export interface KeywordResponse {
  id: number;
  domain_id?: number;
  keyword: string;
  category?: string;
  platforms: string[];
  auto_query: boolean;
  visibility: number;
  score: number;
  trend: TrendType;
  status: KeywordStatus;
  mentions: number;
  position?: number;
  created_at: string;
  updated_at: string;
}

export interface KeywordListResponse {
  keywords: KeywordResponse[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ==================== COMPETITORS ====================
export interface CreateCompetitorRequest {
  domain: string;
  name?: string;
  logo?: string;
}

export interface CompetitorResponse {
  id: number;
  domain: string;
  name: string;
  logo?: string;
  geo_score: number;
  trend: number;
  trend_type: TrendType;
  keywords_ranking: number;
  mentions: number;
  comparison: ComparisonType;
  difference: number;
  last_analysis?: string;
  last_analyzed_at?: string;
  created_at: string;
}

export interface CompetitorListResponse {
  competitors: CompetitorResponse[];
  total: number;
}

export interface CompetitorPlatformStat {
  platform: string;
  mentions: number;
  avg_pos: number;
  score: number;
}

export interface CompetitorKeywordStat {
  keyword: string;
  best_pos: number;
  count: number;
}

export interface CompetitorAnalysisResponse {
  competitor: CompetitorResponse;
  analysis: string;
  geo_score: number;
  platforms: CompetitorPlatformStat[];
  keywords: CompetitorKeywordStat[];
}

export interface KeywordAnalysis {
  keyword: string;
  mentioned: boolean;
  position: number;
}

export interface PlatformAnalysis {
  platform: string;
  score: number;
  mentions: number;
}

// ==================== RECOMMENDATIONS ====================
export interface RecommendationResponse {
  id: number;
  keyword_id?: number;
  keyword?: string;
  priority: Priority;
  category: RecommendationCategory;
  title: string;
  description: string;
  impact: string;
  status: RecommendationStatus;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RecommendationListResponse {
  recommendations: RecommendationResponse[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface UpdateRecommendationStatusRequest {
  status: RecommendationStatus;
}

// ==================== AI RECOMMENDATIONS ====================
export interface AIRecommendation {
  id: number;
  mention_id: number;
  workspace_id: number;
  keyword_id: number;
  platform: Platform;
  position: number;
  name: string;
  domain: string;
  description: string;
  is_target: boolean;
  created_at: string;
}

export interface QueryInsight {
  id: number;
  workspace_id: number;
  keyword_id: number;
  platform: Platform;
  intent: string;
  answer_format: string;
  total_mentions: number;
  created_at: string;
}

// ==================== REPORTS ====================
export interface GenerateReportRequest {
  type: ReportType;
  format?: ReportFormat;
  domain_id?: number;
}

export interface ReportSection {
  id: number;
  section_type: 'executive_summary' | 'performance_analysis' | 'platform_breakdown' | 'competitive_landscape' | 'risks_threats' | 'recommendations';
  title: string;
  content: string;
  sort_order: number;
}

// Structured report data types
export interface ReportContentMeta {
  domain: string;
  geo_score: number;
  period: string;
  mention_rate: number;
  keyword_count: number;
  platform_rates: Record<string, number>;
  top_keywords: { keyword: string; score: number }[];
  worst_keywords: { keyword: string; score: number }[];
  competitors: { domain: string; score: number; is_you: boolean }[];
}

export interface ReportPlatformInsight {
  platform: string;
  label: string;
  insight: string;
  status: 'strong' | 'moderate' | 'weak';
}

export interface ReportRisk {
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
}

export interface ReportRec {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  impact: string;
}

export interface ReportSiteOverview {
  access_status: 'ok' | 'blocked' | 'partial' | 'unknown';
  block_reason: string;
  block_advice: string;
  summary: string;
  pages: {
    path: string;
    title: string;
    type: string;
    summary: string;
    ai_mentions: number;
  }[];
}

export interface ReportMarketTrend {
  title: string;
  description: string;
  bullets: string[];
}

export interface ReportCompetitorIntel {
  name: string;
  domain: string;
  founded: string;
  ai_presence: string;
  trust_signals: string;
  content_notes: string;
}

export interface ReportBenchmark {
  label: string;
  yours: number;
  industry: number;
  top: number;
}

export interface ReportCitation {
  url: string;
  title: string;
  snippet: string;
}

export interface ReportDetailResponse extends ReportResponse {
  sections: ReportSection[];
  meta?: ReportContentMeta;
  platform_insights?: ReportPlatformInsight[];
  risks?: ReportRisk[];
  recommendations?: ReportRec[];
  site_overview?: ReportSiteOverview;
  market_trends?: ReportMarketTrend[];
  competitor_intel?: ReportCompetitorIntel[];
  benchmarks?: ReportBenchmark[];
  citations?: ReportCitation[];
}

export interface ReportResponse {
  id: number;
  name?: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  progress: number;
  file_url?: string;
  generated_at?: string;
  sent_at?: string;
  created_at: string;
  sections?: ReportSection[];
}

export interface ReportListResponse {
  reports: ReportResponse[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ReportSettingsRequest {
  weekly_enabled?: boolean;
  monthly_enabled?: boolean;
}

export interface ReportSettingsResponse {
  weekly_enabled: boolean;
  monthly_enabled: boolean;
  weekly_last_sent?: string;
  monthly_last_sent?: string;
  owner_email?: string;
  recipients?: string[];
}

// ==================== SCHEDULING ====================
export interface SchedulingResponse {
  plan: string;
  reports: ReportScheduling;
  recommendations: RecommendationScheduling;
  keywords: KeywordScheduling;
}

export interface ReportScheduling {
  auto_generate: boolean;
  send_email: boolean;
  frequency: string;
  cron_description: string;
  next_run_at?: string;
  last_generated_at?: string;
  used: number;
  limit: number;
  owner_email: string;
  recipients: string[];
}

export interface RecommendationScheduling {
  auto_generate: boolean;
  send_email: boolean;
  enabled: boolean;
  frequency: string;
  cron_description: string;
  next_run_at?: string;
  last_generated_at?: string;
  used: number;
  limit: number;
}

export interface KeywordScheduling {
  frequency: string;
  cron_description: string;
  next_run_at?: string;
  last_queried_at?: string;
  used: number;
  limit: number;
  auto_query_count: number;
  total_keywords: number;
  allowed_platforms: string[];
  domain_id?: number;
  send_email: boolean;
}

export interface UpdateReportSchedulingRequest {
  auto_generate?: boolean;
  send_email?: boolean;
}

export interface UpdateRecommendationSchedulingRequest {
  auto_generate?: boolean;
  send_email?: boolean;
}

export interface UpdateKeywordSchedulingRequest {
  domain_id: number | null;
  send_email?: boolean;
}

// ==================== TEAM ====================
export interface InviteMemberRequest {
  email: string;
  role: TeamRole;
}

export interface UpdateRoleRequest {
  role: TeamRole;
}

export interface TeamMemberResponse {
  id: number;
  user_id?: number;
  email: string;
  name?: string;
  avatar?: string;
  role: TeamRole;
  status: MemberStatus;
  invited_at: string;
  joined_at?: string;
}

export interface TeamMemberListResponse {
  members: TeamMemberResponse[];
  total: number;
}

// ==================== BILLING ====================
export interface PlanResponse {
  name: string;
  display_name: string;
  price: number;
  annual_price?: number;
  billing_interval?: string;
  domain_limit: number;
  keyword_limit: number;
  competitor_limit: number;
  team_member_limit: number;
  report_limit: number;
  recommendation_limit: number;
  query_limit: number;
  allowed_models: string[];
  report_frequency: string;
  recommendations_enabled: boolean;
  competitors_enabled: boolean;
  api_enabled: boolean;
  integrations_enabled: boolean;
  team_enabled: boolean;
  cancel_at?: string | null;
}

export interface ModelDailyUsage {
  platform: string;
  label: string;
  used: number;
  limit: number; // 0 = unlimited
}

export interface DailyQueryUsageResponse {
  standard_models: ModelDailyUsage[];
  premium_models?: ModelDailyUsage[];
  resets_in: string; // "HH:MM:SS"
}

export interface UsageResponse {
  domains_used: number;
  domain_limit: number;
  keywords_used: number;
  keyword_limit: number;
  queries_used: number;
  query_limit: number;
  competitors_used: number;
  competitor_limit: number;
  reports_used: number;
  report_limit: number;
  recommendation_runs_used: number;
  recommendation_limit: number;
}

export interface InvoiceResponse {
  id: number;
  number: string;
  description: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  paid_at?: string;
  pdf_url?: string;
  created_at: string;
}

export interface InvoiceListResponse {
  invoices: InvoiceResponse[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface PaymentMethodInfo {
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
}

export interface PlanDetails {
  name: string;
  display_name: string;
  price: number;
  annual_price?: number;
  popular: boolean;
  domain_limit: number;
  keyword_limit: number;
  competitor_limit: number;
  team_member_limit: number;
  report_limit: number;
  allowed_models: string[];
  report_frequency: string;
  recommendations_enabled: boolean;
  competitors_enabled: boolean;
  api_enabled: boolean;
  integrations_enabled: boolean;
  team_enabled: boolean;
}

export interface CheckoutResponse {
  url: string;
}

export interface PortalResponse {
  url: string;
}

export interface UpgradeRequiredResponse {
  error: "upgrade_required";
  message: string;
  feature: string;
  required_plan: string;
  current_plan: string;
}

// ==================== DOWNGRADE ====================
export interface DowngradeImpact {
  keywords_over: number;
  competitors_over: number;
  domains_over: number;
  team_members_over: number;
  lose_team: boolean;
  lose_api: boolean;
  lose_integrations: boolean;
  lose_competitors: boolean;
}

// ==================== API KEYS ====================
export interface CreateAPIKeyRequest {
  name: string;
  type: APIKeyType;
  expires_at?: string;
}

export interface APIKeyResponse {
  id: number;
  name: string;
  key_prefix: string;
  type: APIKeyType;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
}

export interface APIKeyCreatedResponse extends APIKeyResponse {
  key: string; // Full key shown only on creation
}

export interface APIKeyListResponse {
  api_keys: APIKeyResponse[];
  total: number;
}

// ==================== INTEGRATIONS ====================
export interface IntegrationResponse {
  id: number;
  type: IntegrationType;
  enabled: boolean;
  config?: { webhook_url?: string; secret?: string; [key: string]: unknown };
  last_sync_at?: string;
  created_at: string;
}

export interface IntegrationListResponse {
  integrations: IntegrationResponse[];
}

export interface ToggleIntegrationRequest {
  enabled: boolean;
}

// ==================== ENUMS ====================
export type Platform = 'chatgpt' | 'claude' | 'perplexity' | 'gemini';

export type TrendType = 'up' | 'down' | 'stable';

export type KeywordStatus = 'ranking' | 'improving' | 'needs_work' | 'not_ranking';

export type ComparisonType = 'ahead' | 'behind' | 'equal';

export type Priority = 'high' | 'medium' | 'low';

export type RecommendationCategory = 'content' | 'authority' | 'faq' | 'technical';

export type RecommendationStatus = 'pending' | 'in_progress' | 'completed';

export type ReportType = 'daily' | 'weekly' | 'monthly' | 'custom';

export type ReportFormat = 'pdf' | 'csv';

export type ReportStatus = 'pending' | 'generating' | 'delivered' | 'completed' | 'failed';

export type TeamRole = 'owner' | 'admin' | 'editor' | 'member' | 'viewer';

export type MemberStatus = 'pending' | 'active' | 'inactive';

export type InvoiceStatus = 'paid' | 'pending' | 'failed';

export type APIKeyType = 'live' | 'test';

export type IntegrationType = 'slack' | 'discord' | 'webhook' | 'zapier' | 'email' | 'google_analytics';

// ==================== NOTIFICATIONS ====================
export interface NotificationItem {
  id: number;
  workspace_id: number;
  user_id?: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: string;
  read: boolean;
  read_at?: string;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  total: number;
  unread_count: number;
}

export type NotificationType =
  | 'new_mention'
  | 'keyword_analyzed'
  | 'report_ready'
  | 'recommendation'
  | 'team_invite'
  | 'team_joined'
  | 'plan_changed'
  | 'payment_failed'
  | 'competitor_analyzed'
  | 'geo_score_changed'
  | 'query_failed'
  | 'recommendation_failed'
  | 'report_failed';

// ==================== SEARCH ====================
export interface SearchItem {
  id: number;
  type: 'keyword' | 'competitor' | 'domain';
  name: string;
  score: number;
  status?: string;
  workspace_id: number;
  workspace_name?: string;
}

export interface SearchResult {
  keywords: SearchItem[];
  competitors: SearchItem[];
  domains: SearchItem[];
}

// ==================== API ERROR ====================
export interface APIError {
  error: string;
  message: string;
  status: number;
}

// ==================== PAGINATION ====================
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
