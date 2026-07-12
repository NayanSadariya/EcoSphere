import { apiClient } from '../api/client';
import { mockResolve, mockRewards, mockLeaderboard } from '../api/mockData';
import type { Reward, RewardRedemption, LeaderboardEntry } from '../types';

const extractData = <T>(res: { data: { success: boolean; data: T } }): T => res.data.data;

export const gamificationService = {
  async getRewards(): Promise<Reward[]> {
    try {
      const res = await apiClient.get('/rewards');
      return extractData(res);
    } catch {
      return mockResolve(mockRewards);
    }
  },

  async redeemReward(rewardId: string): Promise<RewardRedemption | null> {
    try {
      const res = await apiClient.post(`/rewards/${rewardId}/redeem`);
      return extractData(res);
    } catch {
      return mockResolve({
        id: `red-${Date.now()}`,
        user: 'usr-001',
        reward: rewardId,
        points_spent: mockRewards.find((r) => r.id === rewardId)?.points_required || 0,
        redeemed_at: new Date().toISOString(),
      });
    }
  },

  async getRedemptions(userId: string): Promise<RewardRedemption[]> {
    try {
      const res = await apiClient.get(`/users/${userId}/rewards/redemptions`);
      return extractData(res);
    } catch {
      return mockResolve([]);
    }
  },

  async getLeaderboard(type: 'xp' | 'points' | 'badges' = 'xp'): Promise<LeaderboardEntry[]> {
    try {
      const res = await apiClient.get(`/leaderboard/${type}`);
      return extractData(res);
    } catch {
      return mockResolve(mockLeaderboard);
    }
  },
};
