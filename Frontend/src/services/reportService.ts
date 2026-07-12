import { apiClient } from '../api/client';
import { mockResolve, mockEnvironmentalReport, mockGovernanceReport, mockSocialReport, mockOrgEsgScore } from '../api/mockData';
import type { EnvironmentalReport, GovernanceReport, SocialReport, OrgEsgScore } from '../types';

const extractData = <T>(res: { data: { success: boolean; data: T } }): T => res.data.data;

export const reportService = {
  async getEnvironmental(): Promise<EnvironmentalReport> {
    try {
      const res = await apiClient.get('/reports/environmental');
      return extractData(res);
    } catch {
      return mockResolve(mockEnvironmentalReport);
    }
  },

  async getSocial(): Promise<SocialReport> {
    try {
      const res = await apiClient.get('/reports/social');
      return extractData(res);
    } catch {
      return mockResolve(mockSocialReport);
    }
  },

  async getGovernance(): Promise<GovernanceReport> {
    try {
      const res = await apiClient.get('/reports/governance');
      return extractData(res);
    } catch {
      return mockResolve(mockGovernanceReport);
    }
  },

  async getEsgSummary(): Promise<OrgEsgScore> {
    try {
      const res = await apiClient.get('/reports/esg-summary');
      return extractData(res);
    } catch {
      return mockResolve(mockOrgEsgScore);
    }
  },

  async getOrgEsgScore(): Promise<OrgEsgScore> {
    try {
      const res = await apiClient.get('/org/esg-score');
      return extractData(res);
    } catch {
      return mockResolve(mockOrgEsgScore);
    }
  },
};
