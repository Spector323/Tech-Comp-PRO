// Сервис для работы с API сервером
import axios from 'axios'

// ✅ ИСПРАВИТЬ БАЗОВЫЙ URL
const API_URL = 'http://localhost:3000/api/'  

// Создаем экземпляр axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
})

// Добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Обрабатываем ошибки
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data)
    
    // Только для ошибки 401 и если это не запрос профиля
    if (error.response?.status === 401 && !error.config.url.includes('/profile')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/auth'
    }
    
    return Promise.reject(error)
  }
)

export { api }