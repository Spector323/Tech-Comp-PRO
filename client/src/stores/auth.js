import { defineStore } from 'pinia';
import { register, login, updateProfile } from '@/api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user')) || null
  }),
  actions: {
    async login(data) {
      try {
        const response = await login(data);
        this.token = response.token;
        this.user = response.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        return response;
      } catch (error) {
        throw error;
      }
    },
    async register(data) {
      try {
        const response = await register(data);
        return response;
      } catch (error) {
        throw error;
      }
    },
    async updateUser(data) {
      try {
        const updatedUser = await updateProfile(this.token, data);
        this.user = updatedUser;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      } catch (error) {
        throw error;
      }
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userRole: (state) => state.user?.role || null
  }
});