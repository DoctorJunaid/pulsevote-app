import { create } from 'zustand';
import { api } from '../services/api';

export const useNotifications = create((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/notifications');
      set({ 
        notifications: data.notifications || [], 
        unreadCount: data.unreadCount || 0,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      set({ isLoading: false });
    }
  },

  markAsRead: async () => {
    try {
      await api.patch('/notifications/read');
      set({ unreadCount: 0 });
    } catch (error) {
      console.error('Failed to mark notifications as read', error);
    }
  }
}));
