import { useQuery } from '@tanstack/react-query';
import { billingApi } from '@/lib/api';
import type { PaginationParams } from '@/types';

export function useBillingPlan() {
  return useQuery({
    queryKey: ['billing', 'plan'],
    queryFn: () => billingApi.getPlan(),
  });
}

export function useBillingUsage() {
  return useQuery({
    queryKey: ['billing', 'usage'],
    queryFn: () => billingApi.getUsage(),
  });
}

export function useInvoices(params?: PaginationParams) {
  return useQuery({
    queryKey: ['billing', 'invoices', params],
    queryFn: () => billingApi.listInvoices(params),
  });
}

export function usePaymentMethod() {
  return useQuery({
    queryKey: ['billing', 'payment-method'],
    queryFn: () => billingApi.getPaymentMethod(),
  });
}

export function useDailyQueryUsage() {
  return useQuery({
    queryKey: ['billing', 'daily-usage'],
    queryFn: () => billingApi.getDailyUsage(),
    refetchInterval: 60_000, // refresh every minute
  });
}
