import { defineStore } from 'pinia';
import { login, register } from '@/service/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userRole: (state) => state.user?.role || null
  },
  actions: {
    async login(data) {
      const response = await login(data);
      this.token = response.token;
      this.user = response.user;
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    },
    async register(data) {
      await register(data);
    },
    async updateUser(data) {
      this.user = { ...this.user, ...data };
      localStorage.setItem('user', JSON.stringify(this.user));
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});