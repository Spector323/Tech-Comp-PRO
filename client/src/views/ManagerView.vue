<template>
  <div class="manager-container">
    <h2>Панель менеджера</h2>
    <button @click="handleLogout" class="btn-logout">Выйти</button>
    <div class="card">
      <h3>Создать заявку</h3>
      <form @submit.prevent="createOrder">
        <input v-model="newOrder.userId" placeholder="ID клиента" required />
        <input v-model="newOrder.service" placeholder="Описание услуги" required />
        <button type="submit" class="btn-primary">Создать</button>
      </form>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { createOrder } from '@/api/auth';

export default {
  name: 'ManagerView',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const toast = useToast();
    return { authStore, router, toast };
  },
  data() {
    return {
      newOrder: {
        userId: '',
        service: ''
      }
    };
  },
  methods: {
    async createOrder() {
      try {
        await createOrder(this.authStore.token, this.newOrder);
        this.toast.success('Заявка создана!');
        this.newOrder = { userId: '', service: '' };
      } catch (error) {
        this.toast.error(error.response?.data?.message || 'Ошибка создания заявки');
      }
    },
    handleLogout() {
      this.authStore.logout();
      this.router.push('/auth');
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
  .btn-logout {
    width: 100%;
    max-width: 200px;
    padding: 12px;
    background: #ffebee;
    color: #c62828;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    margin: 24px auto;
    display: block;
  }
  
  .btn-logout:hover {
    background: #ffcdd2;
  }
  .manager-container {
    width: 1440px;
    margin: 0 auto;
    padding: 24px;
  }
  
  .card {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    padding: 24px;
    margin-top: 24px;
  }
  
  input {
    width: 100%;
    padding: 14px 16px;
    margin-bottom: 16px;
    border: 1px solid #eaeaea;
    border-radius: 12px;
    font-size: 16px;
  }
  
  .btn-primary {
    width: 100%;
    padding: 14px;
    background: #333;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    cursor: pointer;
  }
  </style>