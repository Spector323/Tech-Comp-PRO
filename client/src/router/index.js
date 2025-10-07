import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Импортируем компоненты страниц
import Home from '@/pages/Home.vue'
import Auth from '@/pages/Auth.vue'
import Profile from '@/pages/Profile.vue'
import Orders from '@/pages/Orders.vue'
import Services from '@/pages/Services.vue'
import About from '@/pages/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/services',
    name: 'Services',
    component: Services
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Защита маршрутов
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth')
  } else {
    next()
  }
})

export default router