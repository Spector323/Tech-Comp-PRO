<template>
    <div class="manager-profile">
      <h1>Профиль менеджера</h1>
      <div class="section" v-animate-onscroll="{ enter: 'fadeInUp' }">
        <h2>Данные</h2>
        <p>Имя: {{ user.firstName }} {{ user.lastName }}</p>
        <p>Email: {{ user.email }}</p>
        <p>Статус: Менеджер</p>
      </div>
      <div class="section" v-animate-onscroll="{ enter: 'fadeInUp' }">
        <h2>Смена пароля</h2>
        <form @submit.prevent="changePassword">
          <input v-model="passwordData.currentPassword" type="password" placeholder="Текущий пароль" required />
          <input v-model="passwordData.newPassword" type="password" placeholder="Новый пароль" required />
          <button type="submit" class="btn-primary">Сменить пароль</button>
        </form>
      </div>
      <div class="section" v-animate-onscroll="{ enter: 'fadeInUp' }">
        <h2>Тема</h2>
        <select v-model="theme" @change="updateTheme">
          <option value="light">Светлая</option>
          <option value="dark">Тёмная</option>
        </select>
      </div>
      <Notification :notifications="notifications" />
    </div>
  </template>
  
  <script>
  import { useAuthStore } from '@/stores/auth';
  import { useRouter } from 'vue-router';
  import { useToast } from 'vue-toastification';
  import Notification from '@/components/Notification.vue';
  import axios from 'axios';
  
  export default {
    name: 'ManagerProfile',
    components: { Notification },
    setup() {
      const authStore = useAuthStore();
      const router = useRouter();
      const toast = useToast();
      return { authStore, router, toast };
    },
    data() {
      return {
        user: this.authStore.user,
        passwordData: { currentPassword: '', newPassword: '' },
        theme: 'light',
        notifications: [
          { id: 1, message: 'Новая заявка создана', date: new Date() },
          { id: 2, message: 'Заявка #123 принята', date: new Date() }
        ]
      };
    },
    methods: {
      async changePassword() {
        try {
          await axios.patch(
            'http://localhost:5000/api/profile/password',
            this.passwordData,
            { headers: { Authorization: `Bearer ${this.authStore.token}` } }
          );
          this.passwordData = { currentPassword: '', newPassword: '' };
          this.toast.success('Пароль изменён!');
        } catch (error) {
          this.toast.error(error.message || 'Ошибка смены пароля');
        }
      },
      updateTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
      }
    },
    mounted() {
      if (!this.authStore.isAuthenticated || this.authStore.userRole !== 'manager') {
        this.router.push('/auth');
      }
    }
  };
  </script>
  
  <style scoped>
  .manager-profile {
    max-width: 1440px;
    margin: 0 auto;
    padding: 32px;
  }
  
  .section {
    margin-bottom: 32px;
  }
  
  h1, h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--primary-color, #2d2d2d);
    margin-bottom: 16px;
  }
  
  p {
    font-size: var(--font-size, 16px);
    margin-bottom: 8px;
  }
  
  form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 400px;
  }
  
  input, select {
    padding: 12px;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    font-size: var(--font-size, 16px);
  }
  
  .btn-primary {
    padding: 12px;
    background: var(--primary-color, #333);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
  
  .btn-primary:hover {
    background: #555;
  }
  </style>