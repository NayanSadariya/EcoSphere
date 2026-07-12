import { apiClient } from '../api/client';
import { mockResolve, mockAuthResponse, mockUser } from '../api/mockData';
import type { AuthResponse, LoginCredentials, SignupData, User } from '../types';

const extractData = <T>(res: { data: { success: boolean; data: T } }): T => res.data.data;

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const res = await apiClient.post('/auth/login', credentials);
      return extractData(res);
    } catch {
      return mockResolve(mockAuthResponse);
    }
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const res = await apiClient.post('/auth/signup', data);
      return extractData(res);
    } catch {
      return mockResolve(mockAuthResponse);
    }
  },

  async getMe(): Promise<User> {
    try {
      const res = await apiClient.get('/auth/me');
      return extractData(res);
    } catch {
      return mockResolve(mockUser);
    }
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const res = await apiClient.put('/auth/profile', updates);
      return extractData(res);
    } catch {
      return mockResolve({ ...mockUser, ...updates });
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.put('/auth/change-password', { currentPassword, newPassword });
    } catch {
      await mockResolve(undefined);
    }
  },
};
