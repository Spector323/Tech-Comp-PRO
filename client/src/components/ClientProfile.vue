<template>
  <div class="profile-container">
    <!-- Левая колонка: профиль -->
    <div class="profile-card">
      <div class="avatar-wrapper">
        <img :src="user.avatar" alt="Аватар" class="avatar" />
        <input
          type="file"
          accept="image/jpeg,image/png"
          @change="onAvatarChange"
          class="avatar-input"
        />
      </div>
      <div class="profile-info">
        <h2>{{ user.firstName }} {{ user.lastName }}</h2>
        <p>{{ user.email }}</p>
        <p v-if="user.phone">{{ user.phone }}</p>
        <div class="status-badge">Активен</div>
      </div>

      <div class="profile-actions">
        <button @click="toggleEdit('profile')" class="btn-edit">
          {{ isEditingProfile ? 'Отмена' : 'Редактировать профиль' }}
        </button>
        <button @click="toggleEdit('password')" class="btn-edit">
          {{ isEditingPassword ? 'Отмена' : 'Сменить пароль' }}
        </button>
        <button @click="onLogout" class="btn-logout">Выйти</button>
      </div>

      <!-- Форма редактирования профиля -->
      <div v-if="isEditingProfile" class="edit-form">
        <form @submit.prevent="onEdit">
          <input v-model="editFirstName" placeholder="Имя" required />
          <input v-model="editLastName" placeholder="Фамилия" required />
          <input v-model="editPhone" placeholder="Телефон" />
          <button type="submit" class="btn-primary">Сохранить</button>
        </form>
      </div>

      <!-- Форма смены пароля -->
      <div v-if="isEditingPassword" class="edit-form">
        <form @submit.prevent="changePassword">
          <input v-model="currentPassword" type="password" placeholder="Текущий пароль" required />
          <input v-model="newPassword" type="password" placeholder="Новый пароль" required />
          <button type="submit" class="btn-primary">Сменить пароль</button>
        </form>
      </div>
    </div>

    <!-- Правая колонка: заявки и статусы -->
    <div class="right-column">
      <!-- Блок: Мои заявки -->
      <div class="card">
        <div class="card-header">
          <h3>Мои заявки</h3>
          <span v-if="orders" class="badge">{{ orders.length }} шт.</span>
        </div>
        <div v-if="!orders" class="loading-state">
          Загрузка заявок...
        </div>
        <div v-else-if="orders.length === 0" class="empty-state">
          У вас пока нет заявок.
        </div>
        <div v-else class="orders-list">
          <div v-for="order in orders" :key="order._id" class="order-item">
            <div class="order-info">
              <span class="order-title">{{ order.service }}</span>
              <span class="order-date">{{ formatDate(order.date) }}</span>
              <div v-if="order.updates?.length" class="updates">
                <p v-for="update in order.updates" :key="update._id">
                  {{ update.description }} ({{ formatDate(update.createdAt) }})
                </p>
              </div>
            </div>
            <div class="order-status" :class="'status-' + order.status">
              {{ statusLabels[order.status] }}
            </div>
          </div>
        </div>
      </div>

      <!-- Блок: Текущий ремонт -->
      <div class="card" v-if="currentOrder">
        <div class="card-header">
          <h3>Текущий ремонт</h3>
          <button @click="viewDetails(currentOrder)" class="btn-small">Подробнее</button>
        </div>
        <div class="repair-progress">
          <div class="progress-step" :class="{ active: currentOrder.progress >= 1 }">
            <div class="step-number">1</div>
            <div class="step-label">Приём</div>
          </div>
          <div class="progress-step" :class="{ active: currentOrder.progress >= 2 }">
            <div class="step-number">2</div>
            <div class="step-label">Диагностика</div>
          </div>
          <div class="progress-step" :class="{ active: currentOrder.progress >= 3 }">
            <div class="step-number">3</div>
            <div class="step-label">Ремонт</div>
          </div>
          <div class="progress-step" :class="{ active: currentOrder.progress >= 4 }">
            <div class="step-number">4</div>
            <div class="step-label">Тест</div>
          </div>
          <div class="progress-step" :class="{ active: currentOrder.progress >= 5 }">
            <div class="step-number">5</div>
            <div class="step-label">Выдача</div>
          </div>
        </div>
        <div class="repair-status">
          <span class="status-badge" :class="'status-' + currentOrder.status">
            {{ statusLabels[currentOrder.status] }}
          </span>
        </div>
      </div>

      <!-- Блок: Настройки -->
      <div class="card">
        <div class="card-header">
          <h3>Настройки</h3>
        </div>
        <div class="settings-list">
          <div class="setting-item">
            <span>Уведомления</span>
            <label class="switch">
              <input type="checkbox" v-model="notificationsEnabled" />
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-item">
            <span>Тема</span>
            <select v-model="theme" class="theme-select">
              <option value="light">Светлая</option>
              <option value="dark">Тёмная</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification';
import { updateProfile, uploadAvatar, changePassword } from '@/service/authService';

export default {
  props: {
    user: { type: Object, required: true },
    orders: { type: Array, default: () => [] },
    currentOrder: { type: Object, default: null }
  },
  emits: ['update-profile', 'logout'],
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      isEditingProfile: false,
      isEditingPassword: false,
      editFirstName: this.user.firstName,
      editLastName: this.user.lastName,
      editPhone: this.user.phone || '',
      currentPassword: '',
      newPassword: '',
      notificationsEnabled: true,
      theme: 'light',
      statusLabels: {
        pending: 'Ожидает',
        in_progress: 'В работе',
        completed: 'Готово',
        blocked: 'Заблокировано'
      }
    };
  },
  watch: {
    user(newUser) {
      this.editFirstName = newUser.firstName;
      this.editLastName = newUser.lastName;
      this.editPhone = newUser.phone || '';
    }
  },
  methods: {
    toggleEdit(mode) {
      if (mode === 'profile') {
        this.isEditingProfile = !this.isEditingProfile;
        this.isEditingPassword = false;
      } else if (mode === 'password') {
        this.isEditingPassword = !this.isEditingPassword;
        this.isEditingProfile = false;
        this.currentPassword = '';
        this.newPassword = '';
      }
    },
    async onEdit() {
      try {
        const data = {
          firstName: this.editFirstName,
          lastName: this.editLastName,
          phone: this.editPhone
        };
        await updateProfile(localStorage.getItem('token'), data);
        this.$emit('update-profile', data);
        this.isEditingProfile = false;
        this.toast.success('Данные профиля обновлены!');
      } catch (error) {
        this.toast.error(error.response?.data?.message || 'Ошибка обновления профиля');
      }
    },
    async onAvatarChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const response = await uploadAvatar(localStorage.getItem('token'), formData);
        this.$emit('update-profile', response);
        this.toast.success('Аватар обновлён!');
      } catch (error) {
        this.toast.error(error.response?.data?.message || 'Ошибка загрузки аватара');
      }
    },
    async changePassword() {
      try {
        await changePassword(localStorage.getItem('token'), {
          currentPassword: this.currentPassword,
          newPassword: this.newPassword
        });
        this.toast.success('Пароль успешно изменён!');
        this.isEditingPassword = false;
        this.currentPassword = '';
        this.newPassword = '';
      } catch (error) {
        this.toast.error(error.response?.data?.message || 'Ошибка смены пароля');
      }
    },
    onLogout() {
      this.$emit('logout');
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ru-RU');
    },
    viewDetails(order) {
      this.toast.info(`Детали заявки: ${order.service}\nОбновления:\n${order.updates.map(u => `${u.description} (${this.formatDate(u.createdAt)})`).join('\n')}`);
    }
  }
};
</script>

<style scoped>
.profile-container {
  width: 1440px;
  margin: 0 auto;
  display: flex;
  margin-top: 120px;
  gap: 24px;
  flex-wrap: wrap;
}

.profile-card {
  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 32px;
  width: 400px;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
  opacity: 0;
  cursor: pointer;
}

.avatar-input:hover + .avatar {
  opacity: 0.7;
}

.profile-info {
  margin-top: 16px;
  text-align: center;
}

.profile-info h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.profile-info p {
  font-size: 16px;
  color: #757575;
  margin-bottom: 8px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #4caf50;
  color: white;
  border-radius: 12px;
  font-size: 14px;
}

.profile-actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-edit,
.btn-logout {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.btn-edit {
  background: #eaeaea;
  color: #333;
}

.btn-edit:hover {
  background: #d5d5d5;
}

.btn-logout {
  background: #c62828;
  color: white;
}

.btn-logout:hover {
  background: #e53935;
}

.edit-form {
  margin-top: 24px;
  width: 100%;
}

.edit-form input {
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  font-size: 16px;
}

.edit-form .btn-primary {
  width: 100%;
  padding: 12px;
  background: #333;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.edit-form .btn-primary:hover {
  background: #555;
}

.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 20px;
  font-weight: 600;
}

.badge {
  background: #333;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
}

.loading-state {
  text-align: center;
  color: #757575;
  padding: 24px;
  font-style: italic;
}

.empty-state {
  text-align: center;
  color: #757575;
  padding: 24px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
}

.order-info {
  flex: 1;
}

.order-title {
  font-size: 16px;
  font-weight: 500;
}

.order-date {
  font-size: 14px;
  color: #757575;
}

.updates {
  margin-top: 8px;
}

.updates p {
  font-size: 14px;
  color: #757575;
}

.order-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
}

.status-pending {
  background: #ff9800;
  color: white;
}

.status-in_progress {
  background: #2196f3;
  color: white;
}

.status-completed {
  background: #4caf50;
  color: white;
}

.status-blocked {
  background: #c62828;
  color: white;
}

.repair-progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.progress-step {
  text-align: center;
  flex: 1;
}

.progress-step.active .step-number {
  background: #333;
  color: white;
}

.step-number {
  width: 32px;
  height: 32px;
  line-height: 32px;
  background: #eaeaea;
  border-radius: 50%;
  margin: 0 auto 8px;
}

.step-label {
  font-size: 14px;
  color: #757575;
}

.repair-status {
  text-align: center;
}

.btn-small {
  background: transparent;
  border: none;
  color: #333;
  font-size: 14px;
  cursor: pointer;
}

.btn-small:hover {
  text-decoration: underline;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ccc;
  transition: 0.4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background: #333;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.theme-select {
  padding: 8px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  font-size: 14px;
}
</style>