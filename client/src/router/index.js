import { createRouter, createWebHistory } from 'vue-router';
import AuthView from '@/views/AuthView.vue';
import ProfileView from '@/views/ProfileView.vue';
import AdminView from '@/views/AdminView.vue';
import ManagerView from '@/views/ManagerView.vue';
import MasterView from '@/views/MasterView.vue';

const routes = [
  {
    path: '/',
    redirect: () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      if (token && user) {
        switch (user.role) {
          case 'client': return '/profile';
          case 'admin': return '/admin';
          case 'manager': return '/manager';
          case 'master': return '/master';
          default: return '/auth';
        }
      }
      return '/auth';
    }
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthView
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true, roles: ['client'] }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/manager',
    name: 'Manager',
    component: ManagerView,
    meta: { requiresAuth: true, roles: ['manager'] }
  },
  {
    path: '/master',
    name: 'Master',
    component: MasterView,
    meta: { requiresAuth: true, roles: ['master'] }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (to.meta.requiresAuth) {
    if (!token || !user) {
      return next('/auth');
    }
    if (to.meta.roles && !to.meta.roles.includes(user.role)) {
      return next('/auth');
    }
  }

  if (to.path === '/auth' && token && user) {
    switch (user.role) {
      case 'client': return next('/profile');
      case 'admin': return next('/admin');
      case 'manager': return next('/manager');
      case 'master': return next('/master');
      default: return next();
    }
  }

  next();
});

export default router;