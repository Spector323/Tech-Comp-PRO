import { defineStore } from 'pinia'
import { api } from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || 'client',
    isAdmin: (state) => state.user?.role === 'admin',
    isManager: (state) => state.user?.role === 'manager', 
    isMaster: (state) => state.user?.role === 'master',
    isClient: (state) => state.user?.role === 'client'
  },

  actions: {
    async register(userData) {
      try {
        console.log('Регистрация:', userData)
        const response = await api.post('auth/register', userData)
        console.log('Ответ регистрации:', response.data)
        
        this.setAuthData(response.data.user, response.data.token)
        return response.data
      } catch (error) {
        console.error('Ошибка регистрации:', error)
        const message = error.response?.data?.message || 'Ошибка регистрации'
        throw new Error(message)
      }
    },

    async login(credentials) {
      try {
        console.log('Вход:', credentials)
        const response = await api.post('/auth/login', credentials)
        console.log('Ответ входа:', response.data)
        
        this.setAuthData(response.data.user, response.data.token)
        return response.data
      } catch (error) {
        console.error('Ошибка входа:', error)
        const message = error.response?.data?.message || 'Ошибка входа'
        throw new Error(message)
      }
    },

    setAuthData(user, token) {
      this.user = user
      this.token = token
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      console.log('Данные сохранены:', { user: user?.email, token: token ? 'exists' : 'null' })
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      console.log('Пользователь разлогинен')
    },

    async getProfile() {
      try {
        console.log('Загрузка профиля...')
        const response = await api.get('/users/profile')
        console.log('Профиль загружен:', response.data)
        
        // ✅ ИСПРАВЛЕНО: правильно парсим ответ
        this.user = response.data.user
        localStorage.setItem('user', JSON.stringify(response.data.user))
        return response.data
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error)
        throw new Error('Ошибка загрузки профиля: ' + (error.response?.data?.message || error.message))
      }
    },

    async updateProfile(userData) {
      try {
        const response = await api.put('/users/profile', userData)
        this.user = response.data.user
        localStorage.setItem('user', JSON.stringify(response.data.user))
        return response.data
      } catch (error) {
        const message = error.response?.data?.message || 'Ошибка обновления профиля'
        throw new Error(message)
      }
    },

    initializeAuth() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        try {
          this.token = token
          this.user = JSON.parse(user)
          console.log('Сессия восстановлена для:', this.user?.email)
        } catch (error) {
          console.error('Ошибка восстановления сессии:', error)
          this.logout()
        }
      } else {
        console.log('Сессия не найдена в localStorage')
      }
    },

    async checkAuth() {
      if (!this.token) {
        return false
      }

      try {
        await api.get('/users/profile')
        return true
      } catch (error) {
        console.log('Токен невалиден:', error)
        this.logout()
        return false
      }
    }
  }
})