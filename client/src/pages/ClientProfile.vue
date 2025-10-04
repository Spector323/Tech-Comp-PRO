<template>
  <div class="client-profile" v-animate-onscroll="{ enter: 'fadeInUp' }">
    <h1>Профиль клиента</h1>
    <div class="section" v-animate-onscroll="{ enter: 'fadeInUp', delay: 200 }">
      <h2>Данные</h2>
      <form @submit.prevent="updateProfile">
        <input v-model="userData.firstName" placeholder="Имя" required />
        <input v-model="userData.lastName" placeholder="Фамилия" required />
        <input v-model="userData.phone" placeholder="Телефон" />
        <input type="file" @change="handleAvatarUpload" accept="image/*" />
        <button type="submit" class="btn-primary">Сохранить</button>
      </form>
    </div>
    <div class="section" v-animate-onscroll="{ enter: 'fadeInUp', delay: 400 }">
      <h2>Смена пароля</h2>
      <form @submit.prevent="changePassword">
        <input v-model="passwordData.currentPassword" type="password" placeholder="Текущий пароль" required />
        <input v-model="passwordData.newPassword" type="password" placeholder="Новый пароль" required />
        <button type="submit" class="btn-primary">Сменить пароль</button>
      </form>
    </div>
    <div class="section" v-animate-onscroll="{ enter: 'fadeInUp', delay: 600 }">
      <h2>Тема</h2>
      <select v-model="theme" @change="updateTheme">
        <option value="light">Светлая</option>
        <option value="dark">Тёмная</option>
      </select>
    </div>
    <div class="section" v-animate-onscroll="{ enter: 'fadeInUp', delay: 800 }">
      <h2>Мои заявки</h2>
      <ul>
        <li v-for="order in orders" :key="order._id">
          {{ order.service }} ({{ categoryLabels[order.category] || order.category }})
          <span :class="'status-' + order.status">{{ statusLabels[order.status] }}</span>
          <p>Прогресс: {{ order.progress }}/5</p>
        </li>
      </ul>
    </div>
    <Notification :notifications="notifications" v-animate-onscroll="{ enter: 'fadeInUp', delay: 1000 }" />
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { getUserOrders, updateProfile, uploadAvatar, changePassword } from '@/service/authService';
import Notification from '@/components/Notification.vue';

export default {
  name: 'ClientProfile',
  components: { Notification },
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const toast = useToast();
    return { authStore, router, toast };
  },
  data() {
    return {
      userData: {
        firstName: this.authStore.user.firstName,
        lastName: this.authStore.user.lastName,
        phone: this.authStore.user.phone || ''
      },
      passwordData: { currentPassword: '', newPassword: '' },
      orders: [],
      theme: 'light',
      notifications: [
        { id: 1, message: 'Ваша заявка создана', date: new Date() },
        { id: 2, message: 'Заявка #123 в работе', date: new Date() }
      ],
      categoryLabels: {
        phone_repair: 'Ремонт телефона',
        laptop_repair: 'Ремонт ноутбука',
        software_install: 'Установка ПО',
        other: 'Другое'
      },
      statusLabels: {
        pending: 'Ожидает',
        in_progress: 'В работе',
        completed: 'Готово',
        blocked: 'Заблокировано'
      }
    };
  },
  methods: {
    async updateProfile() {
      try {
        await updateProfile(this.authStore.token, this.userData);
        this.authStore.setUser({ ...this.authStore.user, ...this.userData });
        this.toast.success('Профиль обновлён!');
      } catch (error) {
        this.toast.error(error.message);
      }
    },
    async handleAvatarUpload(event) {
      try {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await uploadAvatar(this.authStore.token, formData);
        this.authStore.setUser({ ...this.authStore.user, avatar: response.avatar });
        this.toast.success('Аватар загружен!');
      } catch (error) {
        this.toast.error(error.message);
      }
    },
    async changePassword() {
      try {
        await changePassword(this.authStore.token, this.passwordData);
        this.passwordData = { currentPassword: '', newPassword: '' };
        this.toast.success('Пароль изменён!');
      } catch (error) {
        this.toast.error(error.message);
      }
    },
    async fetchOrders() {
      try {
        this.orders = await getUserOrders(this.authStore.token, this.authStore.user._id);
      } catch (error) {
        this.toast.error(error.message);
      }
    },
    updateTheme() {
      document.documentElement.setAttribute('data-theme', this.theme);
    }
  },
  mounted() {
    if (!this.authStore.isAuthenticated || this.authStore.userRole !== 'client') {
      this.router.push('/auth');
    } else {
      this.fetchOrders();
    }
  }
};
</script>

<style scoped>
.client-profile {
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
  color: var(--primary-color);
  margin-bottom: 16px;
}

p {
  font-size: var(--font-size);
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
  font-size: var(--font-size);
}

.btn-primary {
  padding: 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: #555;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 12px;
  border-bottom: 1px solid #eaeaea;
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