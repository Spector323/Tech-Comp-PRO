<template>
  <div class="home-container" v-animate-onscroll="{ enter: 'fadeInUp' }">
    <h1 v-if="user?.firstName">Добро пожаловать, {{ user.firstName }}!</h1>
    <h1 v-else>Добро пожаловать!</h1>
    <p>Создайте заявку на любую услугу.</p>
    <div class="create-order" v-animate-onscroll="{ enter: 'fadeInUp', delay: 200 }">
      <h2>Создать заявку</h2>
      <form @submit.prevent="openModal">
        <select v-model="newOrder.category" required>
          <option value="" disabled>Выберите категорию</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ categoryLabels[cat] }}</option>
        </select>
        <input v-model="newOrder.service" placeholder="Описание услуги" required />
        <button type="submit" class="btn-primary">Отправить заявку</button>
      </form>
    </div>
    <div v-if="showModal" class="modal" v-animate-onscroll="{ enter: 'zoomIn' }">
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
  name: 'Home',
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
        this.toast.error(error.message);
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
.home-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 32px;
  text-align: center;
}

h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 16px;
}

p {
  font-size: var(--font-size);
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
  font-size: var(--font-size);
}

.create-order .btn-primary {
  width: 100%;
  padding: 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: var(--font-size);
  cursor: pointer;
  transition: background 0.3s ease;
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
  font-size: var(--font-size);
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
  font-size: var(--font-size);
  cursor: pointer;
}

.modal-actions .btn-primary {
  background: var(--primary-color);
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