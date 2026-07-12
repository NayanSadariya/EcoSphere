import { useQuery } from './useQuery';
import { reportService } from '../services/reportService';
import { departmentService } from '../services/departmentService';
import { gamificationService } from '../services/gamificationService';
import { notificationService } from '../services/notificationService';
import type {
  OrgEsgScore,
  EnvironmentalReport,
  SocialReport,
  GovernanceReport,
  DepartmentScore,
  Reward,
  Notification,
  LeaderboardEntry,
} from '../types';

export function useOrgEsgScore() {
  return useQuery<OrgEsgScore>(() => reportService.getOrgEsgScore());
}

export function useEnvironmentalReport() {
  return useQuery<EnvironmentalReport>(() => reportService.getEnvironmental());
}

export function useSocialReport() {
  return useQuery<SocialReport>(() => reportService.getSocial());
}

export function useGovernanceReport() {
  return useQuery<GovernanceReport>(() => reportService.getGovernance());
}

export function useDepartmentScores() {
  return useQuery<DepartmentScore[]>(() => departmentService.getScores());
}

export function useRewards() {
  return useQuery<Reward[]>(() => gamificationService.getRewards());
}

export function useNotifications() {
  return useQuery<Notification[]>(() => notificationService.getNotifications());
}

export function useLeaderboard(type: 'xp' | 'points' | 'badges' = 'xp') {
  return useQuery<LeaderboardEntry[]>(() => gamificationService.getLeaderboard(type), [type]);
}
