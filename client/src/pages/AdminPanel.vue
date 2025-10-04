<template>
  <div class="admin-panel">
    <h1>Панель администратора</h1>
    <div class="section" v-animate-onscroll="{ enter: 'fadeInUp' }">
      <h2>Управление категориями</h2>
      <form @submit.prevent="addCategory">
        <input v-model="newCategory" placeholder="Новая категория (например, tablet_repair)" required />
        <button type="submit" class="btn-primary">Добавить</button>
      </form>
      <ul>
        <li v-for="category in categories" :key="category">
          {{ categoryLabels[category] || category }}
          <button @click="removeCategory(category)" class="btn-danger">Удалить</button>
        </li>
      </ul>
    </div>
    <div class="section" v-animate-onscroll="{ enter: 'fadeInUp' }">
      <h2>Настройки темы</h2>
      <label>Основной цвет:</label>
      <input type="color" v-model="theme.primaryColor" @change="updateTheme" />
      <label>Размер шрифта:</label>
      <select v-model="theme.fontSize" @change="updateTheme">
        <option value="14px">Маленький</option>
        <option value="16px">Средний</option>
        <option value="18px">Большой</option>
      </select>
    </div>
    <div class="section" v-animate-onscroll="{ enter: 'fadeInUp' }">
      <h2>Пользователи</h2>
      <input v-model="searchEmail" placeholder="Поиск по email" @input="searchUsers" />
      <ul>
        <li v-for="user in users" :key="user._id">
          {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
          <button @click="editUser(user._id)" class="btn-primary">Редактировать</button>
        </li>
      </ul>
    </div>

  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import axios from 'axios';

export default {
  name: 'AdminPanel',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const toast = useToast();
    return { authStore, router, toast };
  },
  data() {
    return {
      newCategory: '',
      categories: ['phone_repair', 'laptop_repair', 'software_install', 'other'],
      categoryLabels: {
        phone_repair: 'Ремонт телефона',
        laptop_repair: 'Ремонт ноутбука',
        software_install: 'Установка ПО',
        other: 'Другое'
      },
      theme: { primaryColor: '#333', fontSize: '16px' },
      searchEmail: '',
      users: []
    };
  },
  methods: {
    async addCategory() {
      try {
        await axios.post(
          'http://localhost:5000/api/categories',
          { category: this.newCategory },
          { headers: { Authorization: `Bearer ${this.authStore.token}` } }
        );
        this.categories.push(this.newCategory);
        this.categoryLabels[this.newCategory] = this.newCategory.replace('_', ' ');
        this.newCategory = '';
        this.toast.success('Категория добавлена!');
      } catch (error) {
        this.toast.error(error.message || 'Ошибка добавления категории');
      }
    },
    async removeCategory(category) {
      try {
        await axios.delete(`http://localhost:5000/api/categories/${category}`, {
          headers: { Authorization: `Bearer ${this.authStore.token}` }
        });
        this.categories = this.categories.filter(c => c !== category);
        delete this.categoryLabels[category];
        this.toast.success('Категория удалена!');
      } catch (error) {
        this.toast.error(error.message || 'Ошибка удаления категории');
      }
    },
    updateTheme() {
      document.documentElement.style.setProperty('--primary-color', this.theme.primaryColor);
      document.documentElement.style.setProperty('--font-size', this.theme.fontSize);
    },
    async searchUsers() {
      try {
        const response = await axios.get(`http://localhost:5000/api/users?email=${this.searchEmail}`, {
          headers: { Authorization: `Bearer ${this.authStore.token}` }
        });
        this.users = response.data;
      } catch (error) {
        this.toast.error(error.message || 'Ошибка поиска пользователей');
      }
    },
    editUser(userId) {
      this.router.push(`/profile/${userId}`);
    }
  },
  mounted() {
    if (!this.authStore.isAuthenticated || this.authStore.userRole !== 'admin') {
      this.router.push('/auth');
    }
  }
};
</script>

<style scoped>
.admin-panel {
  max-width: 1440px;
  margin: 0 auto;
  padding: 32px;
}

.section {
  margin-bottom: 32px;
}

h1,
h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color, #2d2d2d);
  margin-bottom: 16px;
}

form {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

input,
select {
  padding: 12px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  font-size: var(--font-size, 16px);
}

.btn-primary,
.btn-danger {
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
  justify-content: space-between;
  align-items: center;
}
</style>