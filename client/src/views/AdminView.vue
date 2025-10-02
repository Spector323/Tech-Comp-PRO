<template>
  <div class="admin-container">
    <h2>Админ-панель</h2>
    <button @click="handleLogout" class="btn-logout">Выйти</button>
    <div class="card">
      <div class="card-header">
        <h3>Все заявки</h3>
      </div>
      <div v-if="orders.length === 0" class="empty-state">
        Заявок нет.
      </div>
      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order._id" class="order-item">
          <div class="order-info">
            <span class="order-title">{{ order.service }}</span>
            <span class="order-date">{{ formatDate(order.date) }}</span>
            <span>Клиент: {{ order.userId.firstName }} {{ order.userId.lastName }}</span>
          </div>
          <div class="order-status" :class="'status-' + order.status">
            {{ statusLabels[order.status] }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { getAllOrders } from '@/api/auth';

export default {
  name: 'AdminView',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    return { authStore, router };
  },
  data() {
    return {
      orders: [],
      statusLabels: {
        pending: 'Ожидает',
        in_progress: 'В работе',
        completed: 'Готово',
        blocked: 'Заблокировано'
      }
    };
  },
  methods: {
    async fetchOrders() {
      try {
        this.orders = await getAllOrders(this.authStore.token);
      } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
      }
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ru-RU');
    },
    handleLogout() {
      this.authStore.logout();
      this.router.push('/auth');
    }
  },
  mounted() {
    if (!this.authStore.isAuthenticated || this.authStore.userRole !== 'admin') {
      this.router.push('/auth');
    } else {
      this.fetchOrders();
    }
  }
};
</script>

<style scoped>
.admin-container {
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

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d2d2d;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 12px;
  border-left: 4px solid #eaeaea;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-title {
  font-weight: 500;
  color: #2d2d2d;
}

.order-date, .order-info span {
  font-size: 14px;
  color: #757575;
}

.order-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-pending {
  background: #fff3e0;
  color: #fb8c00;
}

.status-in_progress {
  background: #e3f2fd;
  color: #333;
}

.status-completed {
  background: #e6f7ee;
  color: #2e7d32;
}

.status-blocked {
  background: #ffcdd2;
  color: #c62828;
}

.empty-state {
  text-align: center;
  color: #757575;
  padding: 24px;
  font-style: italic;
}
</style>