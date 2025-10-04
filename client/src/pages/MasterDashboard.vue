<template>
  <div class="master-container">
    <h1>Панель мастера</h1>
    <p>Ваши назначенные заявки</p>
    <div class="orders-list">
      <div v-if="loading" class="loading-state">Загрузка...</div>
      <div v-else-if="orders.length === 0" class="empty-state">Нет назначенных заявок</div>
      <div v-else v-for="order in orders" :key="order._id" class="order-card">
        <div class="order-info">
          <h3>{{ order.service }}</h3>
          <p>Клиент: {{ order.userId.firstName }} {{ order.userId.lastName }}</p>
          <p>Дата: {{ formatDate(order.date) }}</p>
          <p>Статус: <span :class="'status-' + order.status">{{ statusLabels[order.status] }}</span></p>
          <p>Прогресс: {{ order.progress }}/5</p>
          <div v-if="order.updates?.length" class="updates">
            <h4>Обновления:</h4>
            <p v-for="update in order.updates" :key="update._id">
              {{ update.description }} ({{ formatDate(update.createdAt) }})
            </p>
          </div>
        </div>
        <div class="order-actions">
          <form @submit.prevent="addUpdate(order._id)">
            <input v-model="newUpdate[order._id]" placeholder="Добавить обновление" required />
            <button type="submit" class="btn-primary">Добавить</button>
          </form>
          <div class="status-update">
            <select v-model="statusUpdate[order._id]" @change="updateOrder(order._id)">
              <option value="pending">Ожидает</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Готово</option>
              <option value="blocked">Заблокировано</option>
            </select>
            <select v-model="progressUpdate[order._id]" @change="updateOrder(order._id)">
              <option value="1">Приём</option>
              <option value="2">Диагностика</option>
              <option value="3">Ремонт</option>
              <option value="4">Тест</option>
              <option value="5">Выдача</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { getMasterOrders, addOrderUpdate, updateOrder } from '@/service/orderService';

export default {
  name: 'Master',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const toast = useToast();
    return { authStore, router, toast };
  },
  data() {
    return {
      orders: [],
      loading: false,
      newUpdate: {},
      statusUpdate: {},
      progressUpdate: {},
      statusLabels: {
        pending: 'Ожидает',
        in_progress: 'В работе',
        completed: 'Готово',
        blocked: 'Заблокировано'
      }
    };
  },
  computed: {
    user() {
      return this.authStore.user;
    }
  },
  methods: {
    async fetchOrders() {
      this.loading = true;
      try {
        this.orders = (await getMasterOrders(this.authStore.token, this.user._id)) || [];
        this.orders.forEach(order => {
          this.newUpdate[order._id] = '';
          this.statusUpdate[order._id] = order.status;
          this.progressUpdate[order._id] = order.progress;
        });
      } catch (error) {
        this.toast.error('Ошибка загрузки заявок');
        this.orders = [];
      } finally {
        this.loading = false;
      }
    },
    async addUpdate(orderId) {
      try {
        await addOrderUpdate(this.authStore.token, orderId, this.newUpdate[orderId]);
        this.toast.success('Обновление добавлено!');
        this.newUpdate[orderId] = '';
        await this.fetchOrders();
      } catch (error) {
        this.toast.error(error.response?.data?.message || 'Ошибка добавления обновления');
      }
    },
    async updateOrder(orderId) {
      try {
        await updateOrder(this.authStore.token, orderId, {
          status: this.statusUpdate[orderId],
          progress: this.progressUpdate[orderId]
        });
        this.toast.success('Заявка обновлена!');
        await this.fetchOrders();
      } catch (error) {
        this.toast.error(error.response?.data?.message || 'Ошибка обновления заявки');
      }
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ru-RU');
    }
  },
  mounted() {
    if (!this.authStore.isAuthenticated || this.authStore.userRole !== 'master') {
      this.router.push('/auth');
    } else {
      this.fetchOrders();
    }
  }
};
</script>

<style scoped>
.master-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 32px;
}

h1 {
  font-size: 28px;
  font-weight: 600;
  color: #2d2d2d;
  margin-bottom: 16px;
}

p {
  font-size: 16px;
  color: #757575;
  margin-bottom: 24px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.order-card {
  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 24px;
}

.order-info {
  flex: 1;
}

.order-info h3 {
  font-size: 20px;
  margin-bottom: 8px;
}

.order-info p {
  font-size: 14px;
  color: #757575;
  margin-bottom: 8px;
}

.updates h4 {
  font-size: 16px;
  margin-top: 16px;
  margin-bottom: 8px;
}

.updates p {
  font-size: 14px;
  color: #757575;
}

.order-actions {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-actions form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-actions input {
  padding: 12px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  font-size: 16px;
}

.order-actions .btn-primary {
  padding: 12px;
  background: #333;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.order-actions .btn-primary:hover {
  background: #555;
}

.status-update {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-update select {
  padding: 12px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  font-size: 16px;
}

.loading-state,
.empty-state {
  text-align: center;
  color: #757575;
  padding: 24px;
}

.status-pending {
  background: #ff9800;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
}

.status-in_progress {
  background: #2196f3;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
}

.status-completed {
  background: #4caf50;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
}

.status-blocked {
  background: #c62828;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
}
</style>