import { apiClient } from '../api/client';
import { mockResolve, mockCSRActivities, mockChallenges, mockBadges, mockSocialReport } from '../api/mockData';
import type { CSRActivity, Challenge, Badge, SocialReport } from '../types';

const extractData = <T>(res: { data: { success: boolean; data: T } }): T => res.data.data;

export const socialService = {
  async getCSRActivities(): Promise<CSRActivity[]> {
    try {
      const res = await apiClient.get('/csr-activities');
      return extractData(res);
    } catch {
      return mockResolve(mockCSRActivities);
    }
  },

  async getChallenges(): Promise<Challenge[]> {
    try {
      const res = await apiClient.get('/challenges');
      return extractData(res);
    } catch {
      return mockResolve(mockChallenges);
    }
  },

  async getBadges(): Promise<Badge[]> {
    try {
      const res = await apiClient.get('/badges');
      return extractData(res);
    } catch {
      return mockResolve(mockBadges);
    }
  },

  async getEmployeeBadges(employeeId: string): Promise<Badge[]> {
    try {
      const res = await apiClient.get(`/employees/${employeeId}/badges`);
      return extractData(res);
    } catch {
      return mockResolve(mockBadges.filter((b) => b.earned));
    }
  },

  async getSocialReport(): Promise<SocialReport> {
    try {
      const res = await apiClient.get('/reports/social');
      return extractData(res);
    } catch {
      return mockResolve(mockSocialReport);
    }
  },
};
