<template>
  <div class="manager-dashboard">
    <h1>Панель менеджера</h1>
    <div class="section" v-animate-onscroll="{ enter: 'fadeInUp' }">
      <h2>Создать заявку</h2>
      <form @submit.prevent="createOrder">
        <input v-model="newOrder.email" placeholder="Email клиента" required />
        <select v-model="newOrder.category" required>
          <option value="" disabled>Выберите категорию</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ categoryLabels[cat] }}</option>
        </select>
        <input v-model="newOrder.service" placeholder="Описание услуги" required />
        <button type="submit" class="btn-primary">Создать</button>
      </form>
    </div>
    <div class="section" v-animate-onscroll="{ enter: 'fadeInUp' }">
      <h2>Новые заявки</h2>
      <ul>
        <li v-for="order in orders" :key="order._id">
          {{ order.service }} ({{ categoryLabels[order.category] }})
          <button @click="acceptOrder(order._id)" class="btn-primary">Принять</button>
          <button @click="rejectOrder(order._id)" class="btn-danger">Отклонить</button>
          <select v-if="order.status === 'in_progress'" v-model="order.assignedMaster" @change="assignMaster(order._id, order.assignedMaster)">
            <option value="" disabled>Выберите мастера</option>
            <option v-for="master in masters" :key="master._id" :value="master._id">{{ master.firstName }} {{ master.lastName }}</option>
          </select>
        </li>
      </ul>
    </div>

  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { createOrder, getAllOrders, updateOrder, getUserByEmail } from '@/service/orderService';
import axios from 'axios';

export default {
  name: 'ManagerDashboard',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const toast = useToast();
    return { authStore, router, toast };
  },
  data() {
    return {
      newOrder: { email: '', service: '', category: '' },
      orders: [],
      masters: [],
      categories: ['phone_repair', 'laptop_repair', 'software_install', 'other'],
      categoryLabels: {
        phone_repair: 'Ремонт телефона',
        laptop_repair: 'Ремонт ноутбука',
        software_install: 'Установка ПО',
        other: 'Другое'
      }
    };
  },
  methods: {
    async createOrder() {
      try {
        const userId = await getUserByEmail(this.authStore.token, this.newOrder.email);
        await createOrder(this.authStore.token, {
          userId,
          service: this.newOrder.service,
          category: this.newOrder.category
        });
        this.newOrder = { email: '', service: '', category: '' };
        this.toast.success('Заявка создана!');
        this.fetchOrders();
      } catch (error) {
        this.toast.error(error.message);
      }
    },
    async fetchOrders() {
      try {
        this.orders = await getAllOrders(this.authStore.token);
      } catch (error) {
        this.toast.error(error.message);
      }
    },
    async fetchMasters() {
      try {
        const response = await axios.get('http://localhost:5000/api/users?role=master', {
          headers: { Authorization: `Bearer ${this.authStore.token}` }
        });
        this.masters = response.data;
      } catch (error) {
        this.toast.error(error.message || 'Ошибка загрузки мастеров');
      }
    },
    async acceptOrder(orderId) {
      try {
        await updateOrder(this.authStore.token, orderId, { status: 'in_progress' });
        this.toast.success('Заявка принята!');
        this.fetchOrders();
      } catch (error) {
        this.toast.error(error.message);
      }
    },
    async rejectOrder(orderId) {
      try {
        await updateOrder(this.authStore.token, orderId, { status: 'blocked' });
        this.toast.success('Заявка отклонена!');
        this.fetchOrders();
      } catch (error) {
        this.toast.error(error.message);
      }
    },
    async assignMaster(orderId, masterId) {
      try {
        await axios.patch(
          `http://localhost:5000/api/orders/assign/${orderId}`,
          { masterId },
          { headers: { Authorization: `Bearer ${this.authStore.token}` } }
        );
        this.toast.success('Мастер назначен!');
        this.fetchOrders();
      } catch (error) {
        this.toast.error(error.message || 'Ошибка назначения мастера');
      }
    }
  },
  mounted() {
    if (!this.authStore.isAuthenticated || this.authStore.userRole !== 'manager') {
      this.router.push('/auth');
    } else {
      this.fetchOrders();
      this.fetchMasters();
    }
  }
};
</script>

<style scoped>
.manager-dashboard {
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

.btn-primary, .btn-danger {
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-primary {
  background: var(--primary-color, #333);
  color: white;
}

.btn-primary:hover {
  background: #555;
}

.btn-danger {
  background: #c62828;
  color: white;
}

.btn-danger:hover {
  background: #b71c1c;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 12px;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>