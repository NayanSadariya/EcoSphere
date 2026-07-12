import { apiClient } from '../api/client';
import { mockResolve, mockNotifications } from '../api/mockData';
import type { Notification } from '../types';

const extractData = <T>(res: { data: { success: boolean; data: T } }): T => res.data.data;

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    try {
      const res = await apiClient.get('/notifications');
      return extractData(res);
    } catch {
      return mockResolve(mockNotifications);
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const res = await apiClient.get('/notifications/unread-count');
      return extractData(res);
    } catch {
      return mockResolve(mockNotifications.filter((n) => !n.is_read).length);
    }
  },

  async markAsRead(id: string): Promise<void> {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch {
      await mockResolve(undefined);
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch('/notifications/read-all');
    } catch {
      await mockResolve(undefined);
    }
  },

  async deleteNotification(id: string): Promise<void> {
    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch {
      await mockResolve(undefined);
    }
  },
};
