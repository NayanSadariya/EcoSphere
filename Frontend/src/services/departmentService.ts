import { apiClient } from '../api/client';
import { mockResolve, mockEnvironmentalReport } from '../api/mockData';
import type { DepartmentScore, EnvironmentalReport } from '../types';

const extractData = <T>(res: { data: { success: boolean; data: T } }): T => res.data.data;

export const departmentService = {
  async getScores(): Promise<DepartmentScore[]> {
    try {
      const res = await apiClient.get('/department-scores');
      const scores = extractData<DepartmentScore[]>(res);
      return scores;
    } catch {
      return mockResolve(
        mockEnvironmentalReport.departmentScores.map((d, i) => ({
          id: `ds-${i}`,
          department: `dep-${i}`,
          departmentName: d.dept,
          environmental_score: d.score,
          social_score: Math.round(d.score * 0.9),
          governance_score: Math.round(d.score * 0.95),
          total_score: d.score,
          calculated_at: new Date().toISOString(),
        }))
      );
    }
  },

  async getScoreByDepartment(departmentId: string): Promise<DepartmentScore | null> {
    try {
      const res = await apiClient.get(`/departments/${departmentId}/score`);
      return extractData(res);
    } catch {
      return mockResolve(null);
    }
  },

  async getEnvironmentalReport(): Promise<EnvironmentalReport> {
    try {
      const res = await apiClient.get('/reports/environmental');
      return extractData(res);
    } catch {
      return mockResolve(mockEnvironmentalReport);
    }
  },
};
