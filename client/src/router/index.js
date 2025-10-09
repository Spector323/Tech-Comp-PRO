import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Импортируем компоненты страниц
import Home from '@/pages/Home.vue'
import Auth from '@/pages/Auth.vue'
import Profile from '@/pages/Profile.vue'
import Orders from '@/pages/Orders.vue'
import Services from '@/pages/Services.vue'
import About from '@/pages/About.vue'
import ManagerPanel from '@/pages/ManagerPanel.vue'
import MasterPanel from '@/pages/MasterPanel.vue'
import AdminPanel from '@/pages/AdminPanel.vue'
// import AdminPanel from '@/pages/AdminPanel.vue'

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
    path: '/manager',
    name: 'ManagerPanel',
    component: ManagerPanel,
    meta: { requiresAuth: true, requiresManager: true }
  },
  {
    path: '/master',
    name: 'MasterPanel',
    component: MasterPanel,
    meta: { requiresAuth: true, requiresMaster: true } // Было requiresManager: true
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true }
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
  } else if (to.meta.requiresManager && !authStore.isManager && !authStore.isAdmin) {
    next('/')
  } else if (to.meta.requiresMaster && !authStore.isMaster && !authStore.isAdmin) {
    next('/')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router