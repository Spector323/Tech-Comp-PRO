<template>
  <div class="master-container">
    <h2>Панель мастера</h2>
    <button @click="handleLogout" class="btn-logout">Выйти</button>
    <div class="card">
      <h3>Добавить обновление к заявке</h3>
      <form @submit.prevent="addUpdate">
        <input v-model="update.orderId" placeholder="ID заявки" required />
        <input v-model="update.description" placeholder="Описание работы" required />
        <button type="submit" class="btn-primary">Добавить</button>
      </form>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { addOrderUpdate } from '@/api/auth';

export default {
  name: 'MasterView',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const toast = useToast();
    return { authStore, router, toast };
  },
  data() {
    return {
      update: {
        orderId: '',
        description: ''
      }
    };
  },
  methods: {
    async addUpdate() {
      try {
        await addOrderUpdate(this.authStore.token, this.update.orderId, this.update.description);
        this.toast.success('Обновление добавлено!');
        this.update = { orderId: '', description: '' };
      } catch (error) {
        this.toast.error(error.response?.data?.message || 'Ошибка добавления обновления');
      }
    },
    handleLogout() {
      this.authStore.logout();
      this.router.push('/auth');
    }
  },
  mounted() {
    if (!this.authStore.isAuthenticated || this.authStore.userRole !== 'master') {
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

.master-container {
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