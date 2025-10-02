<template>
  <div class="profile-container">
    <!-- Левая колонка: профиль -->
    <div class="profile-card">
      <div class="avatar-wrapper">
        <img :src="user.avatar" alt="Аватар" class="avatar" />
        <input type="file" accept="image/jpeg,image/png" @change="onAvatarChange" class="avatar-input" />
      </div>
      <div class="profile-info">
        <h2>{{ user.firstName }} {{ user.lastName }}</h2>
        <p>{{ user.email }}</p>
        <p v-if="user.phone">{{ user.phone }}</p>
        <div class="status-badge">Активен</div>
      </div>

      <div class="profile-actions">
        <button @click="isEditing = !isEditing" class="btn-edit">
          {{ isEditing ? 'Отмена' : 'Редактировать профиль' }}
        </button>
        <button @click="onLogout" class="btn-logout">Выйти</button>
      </div>

      <!-- Форма редактирования -->
      <div v-if="isEditing" class="edit-form">
        <form @submit.prevent="onEdit">
          <input v-model="editFirstName" placeholder="Имя" required />
          <input v-model="editLastName" placeholder="Фамилия" required />
          <input v-model="editPhone" placeholder="Телефон" />
          <button type="submit" class="btn-primary">Сохранить</button>
        </form>
      </div>
    </div>

    <!-- Правая колонка: заявки и статусы -->
    <div class="right-column">
      <!-- Блок: Мои заявки -->
      <div class="card">
        <div class="card-header">
          <h3>Мои заявки</h3>
          <span class="badge">{{ orders.length }} шт.</span>
          <div v-if="orders.length === 0" class="empty-state">
            У вас пока нет заявок.
          </div>
        </div>
        <div v-if="!orders" class="loading-state">
          Загрузка заявок...
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
import axios from 'axios';

export default {
  props: {
    user: { type: Object, required: true },
    orders: { type: Array, default: () => [] }, // Дефолтное значение - пустой массив
    currentOrder: { type: Object, default: null }
  },
  emits: ['update-profile', 'logout'],
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      isEditing: false,
      editFirstName: this.user.firstName,
      editLastName: this.user.lastName,
      editPhone: this.user.phone || '',
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
    async onEdit() {
      try {
        this.$emit('update-profile', {
          firstName: this.editFirstName,
          lastName: this.editLastName,
          phone: this.editPhone
        });
        this.isEditing = false;
        this.toast.success('Данные профиля обновлены!');
      } catch (error) {
        this.toast.error('Ошибка обновления профиля');
      }
    },
    async onAvatarChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const response = await axios.post('http://localhost:5000/api/profile/avatar', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        this.$emit('update-profile', response.data);
        this.toast.success('Аватар обновлён!');
      } catch (error) {
        this.toast.error(error.response?.data?.message || 'Ошибка загрузки аватара');
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
.avatar-wrapper {
  position: relative;
  display: inline-block;
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

.avatar-input:hover+.avatar {
  opacity: 0.7;
}

.edit-form {
  margin-top: 24px;
  width: 100%;
  padding: 0 32px;
}

.edit-form input {
  width: 100%;
  padding: 14px 16px;
  margin-bottom: 16px;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  font-size: 16px;
  background: #ffffff;
  color: #2d2d2d;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.edit-form input:focus {
  outline: none;
  border-color: #333;
  box-shadow: 0 0 0 3px rgba(29, 120, 217, 0.12);
}

.edit-form .btn-primary {
  width: 100%;
  padding: 14px;
  background: #333;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.edit-form .btn-primary:hover {
  background: #555;
}

/* Остальные стили без изменений */
.profile-container {
  width: 1440px;
  margin: 0 auto;
  display: flex;
  margin-top: 120px;
  gap: 24px;
  flex-wrap: wrap;
}

.profile-container {
  width: 1440px;
  margin: 0 auto;
  display: flex;
  margin-top: 120px;
  gap: 24px;
  flex-wrap: wrap;
}

/* Левая карточка профиля */
.profile-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  padding: 70px 0;
  gap: 30px;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  max-width: 300px;
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 16px;
  border: 2px solid #f5f5f5;
}

.profile-info h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2d2d2d;
}

.profile-info p {
  color: #757575;
  font-size: 15px;
  margin-bottom: 12px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #e6f7ee;
  color: #2e7d32;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.btn-edit {
  width: 100%;
  padding: 12px;
  background: #f5f5f5;
  color: #2d2d2d;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-edit:hover {
  background: #eaeaea;
}

.btn-logout {
  width: 100%;
  padding: 12px;
  background: #ffebee;
  color: #c62828;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: #ffcdd2;
}

/* Правая колонка */
.right-column {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  padding: 24px;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d2d2d;
}

.badge {
  background: #e3f2fd;
  color: #333;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  color: #757575;
  padding: 24px;
  font-style: italic;
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

.order-date {
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

/* Прогресс-бар ремонта */
.repair-progress {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 0;
  position: relative;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
}

.step-number {
  width: 28px;
  height: 28px;
  background: #eaeaea;
  color: #757575;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.step-label {
  font-size: 12px;
  color: #757575;
  text-align: center;
}

.progress-step.active .step-number {
  background: #333;
  color: white;
}

.progress-step.active .step-label {
  color: #2d2d2d;
  font-weight: 500;
}

/* Разделитель между шагами */
.progress-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 14px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: #eaeaea;
  z-index: -1;
}

.progress-step.active:not(:last-child)::after {
  background: #333;
}

.repair-status {
  text-align: center;
  margin-top: 16px;
}

/* Настройки */
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

.theme-select {
  padding: 8px 12px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  font-size: 14px;
  background: #ffffff;
  color: #2d2d2d;
}

/* Переключатель (switch) */
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
  background: #eaeaea;
  transition: 0.2s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background: white;
  transition: 0.2s;
  border-radius: 50%;
}

input:checked+.slider {
  background: #333;
}

input:checked+.slider:before {
  transform: translateX(20px);
}

/* Маленькая кнопка */
.btn-small {
  padding: 6px 12px;
  background: #f5f5f5;
  color: #2d2d2d;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-small:hover {
  background: #eaeaea;
}

/* Адаптив */
@media (max-width: 768px) {
  .profile-container {
    flex-direction: column;
  }

  .profile-card {
    max-width: 100%;
  }

  .right-column {
    min-width: auto;
  }
}
</style>