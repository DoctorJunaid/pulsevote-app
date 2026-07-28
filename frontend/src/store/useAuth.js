import { create } from 'zustand';
import { api } from '../services/api';

export const useAuth = create((set, get) => ({
  user: null,
  userStats: { created: 0, voted: 0, bookmark: 0 },
  token: localStorage.getItem('pollify_token') || null,
  isAuthenticated: !!localStorage.getItem('pollify_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('pollify_token', data.token);
      set({ 
        user: data.user, 
        token: data.token, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      const errData = error.response?.data;
      return { 
        success: false, 
        error: errData?.message || 'Login failed',
        needsVerification: errData?.needsVerification,
        email: errData?.email || email
      };
    }
  },

  register: async (formData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/register', formData);
      set({ isLoading: false });
      return { 
        success: true, 
        message: data.message, 
        needsVerification: data.needsVerification,
        email: data.email || (formData instanceof FormData ? formData.get('email') : formData.email)
      };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  },

  verifyOtp: async (email, otp) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      localStorage.setItem('pollify_token', data.token);
      set({ 
        user: data.user, 
        token: data.token, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'OTP verification failed' };
    }
  },

  resendOtp: async (email) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/resend-otp', { email });
      set({ isLoading: false });
      return { success: true, message: data.message || 'OTP resent successfully' };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Failed to resend OTP' };
    }
  },

  updateProfile: async (formData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.patch('/auth/profile', formData);
      set({ user: data.user, isLoading: false });
      return { success: true, user: data.user };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Failed to update profile' };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true });
    try {
      const { data } = await api.patch('/auth/password', { currentPassword, newPassword });
      set({ isLoading: false });
      return { success: true, message: data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Failed to change password' };
    }
  },

  deleteAccount: async () => {
    try {
      await api.delete('/auth/account');
      get().logout();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete account' };
    }
  },

  logout: () => {
    localStorage.removeItem('pollify_token');
    set({ user: null, userStats: { created: 0, voted: 0, bookmark: 0 }, token: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ 
        user: data.user,
        userStats: {
          created: data.created || 0,
          voted: data.voted || 0,
          bookmark: data.bookmark || 0,
        }
      });
    } catch (error) {
      localStorage.removeItem('pollify_token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  }
}));
