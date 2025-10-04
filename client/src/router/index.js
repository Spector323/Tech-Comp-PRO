import { createRouter, createWebHistory } from 'vue-router';
import Auth from '@/components/Auth.vue';
import Home from '@/pages/Home.vue';
import Service from '@/pages/Service.vue';
import ClientProfile from '@/pages/ClientProfile.vue';
import AdminPanel from '@/pages/AdminPanel.vue';
import ManagerDashboard from '@/pages/ManagerDashboard.vue';
import ManagerProfile from '@/pages/ManagerProfile.vue';
import MasterDashboard from '@/pages/MasterDashboard.vue';
import MasterProfile from '@/pages/MasterProfile.vue';
import { useAuthStore } from '@/stores/auth';

// Определяем маршруты
const routes = [
  {
    path: '/auth',
    name: 'Auth',
    component: Auth
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true, roles: ['client', 'manager', 'master', 'admin'] }
  },
  {
    path: '/service',
    name: 'Service',
    component: Service,
    meta: { requiresAuth: true, roles: ['client'] }
  },
  {
    path: '/profile',
    name: 'ClientProfile',
    component: ClientProfile,
    meta: { requiresAuth: true, roles: ['client'] }
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/manager',
    name: 'ManagerDashboard',
    component: ManagerDashboard,
    meta: { requiresAuth: true, roles: ['manager'] }
  },
  {
    path: '/manager-profile',
    name: 'ManagerProfile',
    component: ManagerProfile,
    meta: { requiresAuth: true, roles: ['manager'] }
  },
  {
    path: '/master',
    name: 'MasterDashboard',
    component: MasterDashboard,
    meta: { requiresAuth: true, roles: ['master'] }
  },
  {
    path: '/master-profile',
    name: 'MasterProfile',
    component: MasterProfile,
    meta: { requiresAuth: true, roles: ['master'] }
  },
  {
    path: '/profile/:userId',
    name: 'UserProfile',
    component: ClientProfile, // Админ может редактировать любой профиль
    meta: { requiresAuth: true, roles: ['admin'] }
  }
];

// Создаём роутер
const router = createRouter({
  history: createWebHistory(),
  routes
});

// Защита маршрутов
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/auth');
  }
  if (to.meta.roles && !to.meta.roles.includes(authStore.userRole)) {
    return next('/auth');
  }
  next();
});

export default router;