<template>
  <div class="header-container" v-if="showHeader">
    <header>
      <div class="logo">Logo</div>
      <div class="cn-link">
        <div class="link-bl"><router-link to="/home">Главная</router-link></div>
        <div class="link-bl"><router-link to="/profile">О нас</router-link></div>
        <div class="link-bl"><router-link to="/service">Сервис</router-link></div>
      </div>
      <div v-if="isAuthenticated" class="profile-cn" @click="goToProfile">
        <img :src="user?.avatar || 'default-avatar.png'" alt="Аватар" class="avatar" />
        <div class="profile">
          <h2 v-if="user?.firstName">{{ user.firstName }} {{ user.lastName }}</h2>
          <p v-if="user?.email">{{ user.email }}</p>
        </div>
      </div>
      <button v-if="isAuthenticated" @click="onLogout" class="btn-logout">Выйти</button>
    </header>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'Header',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const route = useRoute();
    return { authStore, router, route };
  },
  computed: {
    user() {
      return this.authStore.user;
    },
    isAuthenticated() {
      return this.authStore.isAuthenticated;
    },
    showHeader() {
      return this.route.path !== '/auth';
    }
  },
  methods: {
    onLogout() {
      this.authStore.logout();
      this.router.push('/auth');
    },
    goToProfile() {
      if (this.authStore.userRole === 'client') {
        this.router.push('/profile');
      } else if (this.authStore.userRole === 'admin') {
        this.router.push('/admin');
      } else if (this.authStore.userRole === 'manager') {
        this.router.push('/manager');
      } else if (this.authStore.userRole === 'master') {
        this.router.push('/master');
      }
    }
  }
};
</script>

<style scoped>
.header-container {
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px 32px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1440px;
  margin: 0 auto;
}

.logo {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.cn-link {
  display: flex;
  gap: 16px;
}

.link-bl a {
  color: #333;
  text-decoration: none;
  font-size: 16px;
}

.link-bl a:hover {
  text-decoration: underline;
}

.profile-cn {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  cursor: pointer;
}

.profile-cn:hover .profile h2,
.profile-cn:hover .profile p {
  color: #555;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
}

.profile h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #2d2d2d;
}

.profile p {
  font-size: 14px;
  color: #757575;
}

.btn-logout {
  background: transparent;
  border: none;
  color: #c62828;
  font-size: 16px;
  cursor: pointer;
  margin-left: 16px;
}

.btn-logout:hover {
  color: #e53935;
}
</style>