import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

import Toast, { TYPE } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

app.use(pinia)
app.use(router)

// Инициализируем authStore после создания приложения
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore()
authStore.initializeAuth()

app.use(Toast, {
    // Можно настроить опции (необязательно)
    position: 'top-right',
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false,
  })

app.mount('#app')