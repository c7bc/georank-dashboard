import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/lib/api';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => profileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => profileApi.updateWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useChangeEmail() {
  return useMutation({
    mutationFn: (data: { new_email: string; password: string }) => profileApi.requestEmailChange(data),
  });
}

export function useConfirmEmailChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { code: string }) => profileApi.confirmEmailChange(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) => profileApi.requestPasswordChange(data),
  });
}

export function useConfirmPasswordChange() {
  return useMutation({
    mutationFn: (data: { code: string }) => profileApi.confirmPasswordChange(data),
  });
}

export function useUpdateWorkspacePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { query_email_enabled?: boolean; recommendation_email_enabled?: boolean }) =>
      profileApi.updateWorkspacePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}
