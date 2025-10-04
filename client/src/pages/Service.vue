<template>
  <div class="service-container">
    <h1>Наши услуги</h1>
    <p>Выберите категорию и создайте заявку.</p>
    <div class="create-order">
      <h2>Создать заявку</h2>
      <form @submit.prevent="openModal">
        <select v-model="newOrder.category" required>
          <option value="" disabled>Выберите категорию</option>
          <option value="phone_repair">Ремонт телефона</option>
          <option value="laptop_repair">Ремонт ноутбука</option>
          <option value="software_install">Установка ПО</option>
          <option value="other">Другое</option>
        </select>
        <input v-model="newOrder.service" placeholder="Описание услуги" required />
        <button type="submit" class="btn-primary">Отправить</button>
      </form>
    </div>
    <!-- Модальное окно -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>Подтверждение</h3>
        <p>Вы уверены, что хотите создать заявку?</p>
        <p>Категория: {{ categoryLabels[newOrder.category] }}</p>
        <p>Описание: {{ newOrder.service }}</p>
        <div class="modal-actions">
          <button @click="createOrder" class="btn-primary">Подтвердить</button>
          <button @click="showModal = false" class="btn-secondary">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { createOrder } from '@/service/orderService';

export default {
  name: 'Service',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const toast = useToast();
    return { authStore, router, toast };
  },
  data() {
    return {
      newOrder: { service: '', category: '' },
      showModal: false,
      categoryLabels: {
        phone_repair: 'Ремонт телефона',
        laptop_repair: 'Ремонт ноутбука',
        software_install: 'Установка ПО',
        other: 'Другое'
      }
    };
  },
  methods: {
    openModal() {
      this.showModal = true;
    },
    async createOrder() {
      try {
        await createOrder(this.authStore.token, this.newOrder);
        this.showModal = false;
        this.toast.success('Заявка создана!');
        this.newOrder = { service: '', category: '' };
        this.router.push('/profile');
      } catch (error) {
        this.showModal = false;
        this.toast.error(error.response?.data?.message || 'Ошибка создания заявки');
      }
    }
  },
  mounted() {
    if (!this.authStore.isAuthenticated) {
      this.router.push('/auth');
    }
  }
};
</script>

<style scoped>
.service-container {
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

.create-order {
  max-width: 400px;
  margin: 24px auto;
}

.create-order h2 {
  font-size: 20px;
  margin-bottom: 16px;
}

.create-order select,
.create-order input {
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  font-size: 16px;
}

.create-order .btn-primary {
  width: 100%;
  padding: 12px;
  background: #333;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.create-order .btn-primary:hover {
  background: #555;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.modal-content h3 {
  font-size: 20px;
  margin-bottom: 16px;
}

.modal-content p {
  font-size: 16px;
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.modal-actions .btn-primary,
.modal-actions .btn-secondary {
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.modal-actions .btn-primary {
  background: #333;
  color: white;
}

.modal-actions .btn-primary:hover {
  background: #555;
}

.modal-actions .btn-secondary {
  background: #eaeaea;
  color: #333;
}

.modal-actions .btn-secondary:hover {
  background: #d5d5d5;
}
</style>