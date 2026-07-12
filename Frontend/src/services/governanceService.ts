import { apiClient } from '../api/client';
import { mockResolve, mockGovernanceReport, mockPolicies, mockAudits, mockIssues } from '../api/mockData';
import type { GovernanceReport, ESGPolicy, Audit, ComplianceIssue } from '../types';

const extractData = <T>(res: { data: { success: boolean; data: T } }): T => res.data.data;

export const governanceService = {
  async getGovernanceReport(): Promise<GovernanceReport> {
    try {
      const res = await apiClient.get('/reports/governance');
      return extractData(res);
    } catch {
      return mockResolve(mockGovernanceReport);
    }
  },

  async getPolicies(): Promise<ESGPolicy[]> {
    try {
      const res = await apiClient.get('/policies');
      return extractData(res);
    } catch {
      return mockResolve(mockPolicies);
    }
  },

  async getAudits(): Promise<Audit[]> {
    try {
      const res = await apiClient.get('/audits');
      return extractData(res);
    } catch {
      return mockResolve(mockAudits);
    }
  },

  async getIssues(): Promise<ComplianceIssue[]> {
    try {
      const res = await apiClient.get('/compliance-issues');
      return extractData(res);
    } catch {
      return mockResolve(mockIssues);
    }
  },

  async acknowledgePolicy(policyId: string): Promise<void> {
    try {
      await apiClient.post(`/policies/${policyId}/acknowledge`);
    } catch {
      await mockResolve(undefined);
    }
  },
};
