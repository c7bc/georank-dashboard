import { api } from './client';
import type {
  TeamMemberListResponse,
  TeamMemberResponse,
  InviteMemberRequest,
  TeamRole,
} from '@/types';

export const teamApi = {
  async listMembers(): Promise<TeamMemberListResponse> {
    return api.get<TeamMemberListResponse>('/team/members');
  },

  async inviteMember(data: InviteMemberRequest): Promise<TeamMemberResponse> {
    return api.post<TeamMemberResponse>('/team/members/invite', data);
  },

  async updateRole(memberId: number, role: TeamRole): Promise<TeamMemberResponse> {
    return api.patch<TeamMemberResponse>(`/team/members/${memberId}/role`, { role });
  },

  async removeMember(memberId: number): Promise<void> {
    return api.delete(`/team/members/${memberId}`);
  },
};
