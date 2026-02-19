import { api } from './client';

export const onboardingApi = {
  async getState(): Promise<{
    hasDomain: boolean;
    hasKeywords: boolean;
    hasCompetitors: boolean;
    keywordLimit: number;
    competitorLimit: number;
    competitorsEnabled: boolean;
  }> {
    return api.get('/onboarding/state');
  },

  async submitDomain(url: string): Promise<{ id: number; url: string }> {
    return api.post('/domains', { url });
  },

  async submitKeywords(keywords: string[], domainId?: number): Promise<void> {
    return api.post('/keywords/bulk', {
      keywords: keywords.map(k => ({ keyword: k, domain_id: domainId })),
    });
  },

  async submitCompetitors(domains: string[]): Promise<void> {
    for (const domain of domains) {
      if (domain.trim()) {
        await api.post('/competitors', { domain });
      }
    }
  },
};
