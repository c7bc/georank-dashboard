import { api } from './client';
import type {
  PlanResponse,
  PlanDetails,
  UsageResponse,
  InvoiceListResponse,
  PaginationParams,
  CheckoutResponse,
  PortalResponse,
  DowngradeImpact,
  PaymentMethodInfo,
  DailyQueryUsageResponse,
} from '@/types';

export const billingApi = {
  async getPlan(): Promise<PlanResponse> {
    return api.get<PlanResponse>('/billing/plan');
  },

  async getUsage(): Promise<UsageResponse> {
    return api.get<UsageResponse>('/billing/usage');
  },

  async getPlans(): Promise<PlanDetails[]> {
    return api.get<PlanDetails[]>('/billing/plans', { skipAuth: true });
  },

  async createCheckout(plan: string, interval: "month" | "year", successUrl: string, cancelUrl: string): Promise<CheckoutResponse> {
    return api.post<CheckoutResponse>('/billing/checkout', {
      plan,
      interval,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  },

  async createPortal(returnUrl: string): Promise<PortalResponse> {
    return api.post<PortalResponse>('/billing/portal', {
      return_url: returnUrl,
    });
  },

  async downgradePreview(plan: string): Promise<DowngradeImpact> {
    return api.get<DowngradeImpact>(`/billing/downgrade-preview?plan=${plan}`);
  },

  async getPaymentMethod(): Promise<PaymentMethodInfo | null> {
    return api.get<PaymentMethodInfo | null>('/billing/payment-method');
  },

  async getDailyUsage(): Promise<DailyQueryUsageResponse> {
    return api.get<DailyQueryUsageResponse>('/billing/daily-usage');
  },

  async listInvoices(params?: PaginationParams): Promise<InvoiceListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));

    const query = searchParams.toString();
    return api.get<InvoiceListResponse>(`/billing/invoices${query ? `?${query}` : ''}`);
  },
};
