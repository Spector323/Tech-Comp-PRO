import { api } from './api'

export const adminService = {
  // ✅ Получить всех пользователей
  async getUsers() {
    const response = await api.get('/users/admin/users')
    return response.data
  },

  // ✅ Создать пользователя
  async createUser(userData) {
    const response = await api.post('/users/admin/users', userData)
    return response.data
  },

  // ✅ Обновить роль пользователя
  async updateUserRole(userId, roleData) {
    const response = await api.patch(`/users/admin/users/${userId}/role`, roleData)
    return response.data
  },

  // ✅ Переключить статус пользователя
  async toggleUserStatus(userId) {
    const response = await api.patch(`/users/admin/users/${userId}/status`)
    return response.data
  },

  // ✅ Удалить пользователя
  async deleteUser(userId) {
    const response = await api.delete(`/users/admin/users/${userId}`)
    return response.data
  },

  // ✅ Получить статистику системы
  async getSystemStats() {
    // Можно добавить отдельный endpoint для статистики
    const response = await api.get('/users/admin/users')
    const users = response.data.users
    
    const stats = {
      totalUsers: users.length,
      masters: users.filter(user => user.role === 'master').length,
      managers: users.filter(user => user.role === 'manager').length,
      clients: users.filter(user => user.role === 'client').length,
      activeUsers: users.filter(user => user.isActive).length
    }
    
    return { success: true, stats }
  }
}