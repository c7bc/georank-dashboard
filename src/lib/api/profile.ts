import { api } from './client';

export const profileApi = {
  async updateProfile(data: { name: string }): Promise<void> {
    return api.put('/auth/profile', data);
  },

  async updateWorkspace(data: { name: string }): Promise<void> {
    return api.put('/auth/workspace', data);
  },

  async requestEmailChange(data: { new_email: string; password: string }): Promise<void> {
    return api.post('/auth/email/request', data);
  },

  async confirmEmailChange(data: { code: string }): Promise<void> {
    return api.post('/auth/email/confirm', data);
  },

  async requestPasswordChange(data: { current_password: string; new_password: string }): Promise<void> {
    return api.post('/auth/password/request', data);
  },

  async confirmPasswordChange(data: { code: string }): Promise<void> {
    return api.post('/auth/password/confirm', data);
  },

  async updateLanguage(language: string): Promise<void> {
    return api.put('/auth/language', { language });
  },

  async updateWorkspacePreferences(data: { query_email_enabled?: boolean; recommendation_email_enabled?: boolean }): Promise<void> {
    return api.patch('/auth/workspace/preferences', data);
  },
};
