<template>
  <div class="profile-container">
    <!-- Левая колонка: профиль -->
    <div class="profile-card">
      <div class="avatar-section">
        <img
          :src="user.avatar || '/avatar.png'"
          :alt="`${user.firstName} ${user.lastName}`"
          class="avatar"
          @error="handleImageError"
        />
        <button @click="triggerAvatarUpload" class="btn-avatar-edit">✏️</button>
        <input
          type="file"
          ref="avatarInput"
          @change="handleAvatarUpload"
          accept="image/*"
          style="display: none"
        />
      </div>
      <div class="profile-info">
        <h2>{{ user.firstName }} {{ user.lastName }}</h2>
        <p>{{ user.email }}</p>
        <p class="user-phone">{{ user.phone }}</p>
        <div class="status-badge">Активен</div>
      </div>

      <div class="profile-actions">
        <button @click="openEditModal" class="btn-edit">Редактировать профиль</button>
        <button @click="onLogout" class="btn-logout">Выйти</button>
      </div>
    </div>

    <!-- Правая колонка: заявки и статусы -->
    <div class="right-column">
      <!-- Блок: Мои заявки -->
      <div class="card">
        <div class="card-header">
          <h3>Мои заявки</h3>
          <span class="badge">{{ filteredOrders.length }} шт.</span>
        </div>
        <div class="orders-filter">
          <button
            v-for="filter in statusFilters"
            :key="filter.key"
            @click="setStatusFilter(filter.key)"
            :class="{ active: currentStatusFilter === filter.key }"
            class="filter-btn"
          >
            {{ filter.label }}
          </button>
        </div>

        <!-- Загрузка -->
        <div v-if="loading.orders" class="loading-state">
          <div class="spinner"></div>
          <span>Загружаем ваши заявки...</span>
        </div>

        <div v-else-if="filteredOrders.length === 0" class="empty-state">
          У вас пока нет заявок в этом статусе.
        </div>
        <div v-else class="orders-list">
          <div
            v-for="order in filteredOrders"
            :key="order._id"
            class="order-item"
            :class="{ 'active-order': currentOrder && currentOrder._id === order._id }"
            @click="setCurrentOrder(order)"
          >
            <div class="order-info">
              <span class="order-title">{{ order.service }}</span>
              <span class="order-date">{{ formatDate(order.createdAt) }}</span>
              <span class="order-price" v-if="order.price">₽{{ order.price }}</span>
            </div>
            <div class="order-status" :class="'status-' + order.status">
              {{ statusLabels[order.status] }}
            </div>
          </div>
        </div>
      </div>

      <!-- Блок: Текущий ремонт -->
      <div class="card" v-if="currentOrder && !loading.orders">
        <div class="card-header">
          <h3>Текущий ремонт</h3>
          <div>
            <button @click="viewDetails(currentOrder)" class="btn-small">Подробнее</button>
            <button
              @click="downloadReport(currentOrder)"
              class="btn-small"
              v-if="currentOrder.status === 'completed'"
            >
              📄 Отчёт
            </button>
          </div>
        </div>
        <div class="current-order-info">
          <h4>{{ currentOrder.service }}</h4>
          <p>Заявка #{{ currentOrder._id }} • {{ formatDate(currentOrder.createdAt) }}</p>
          <p v-if="currentOrder.description" class="order-description">{{ currentOrder.description }}</p>
        </div>
        <div class="repair-progress">
          <div
            v-for="step in progressSteps"
            :key="step.number"
            class="progress-step"
            :class="{
              active: currentOrder.progress >= step.number,
              completed: currentOrder.progress >= step.number,
            }"
          >
            <div class="step-number">{{ step.number }}</div>
            <div class="step-label">{{ step.label }}</div>
          </div>
        </div>
        <div class="repair-status">
          <span class="status-badge" :class="'status-' + currentOrder.status">
            {{ statusLabels[currentOrder.status] }}
          </span>
          <span class="progress-text">Шаг {{ currentOrder.progress }} из {{ progressSteps.length }}</span>
        </div>
      </div>

      <!-- Блок: Настройки -->
      <div class="card">
        <div class="card-header">
          <h3>Настройки</h3>
        </div>
        <div class="settings-list">
          <div class="setting-item">
            <span>Email уведомления</span>
            <label class="switch">
              <input
                type="checkbox"
                v-model="notificationsEnabled"
                @change="saveSettings"
              />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования профиля -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Редактировать профиль</h3>
          <button @click="closeEditModal" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Имя</label>
            <input
              type="text"
              v-model="editForm.firstName"
              class="form-input"
              placeholder="Введите имя"
            />
          </div>
          <div class="form-group">
            <label>Фамилия</label>
            <input
              type="text"
              v-model="editForm.lastName"
              class="form-input"
              placeholder="Введите фамилию"
            />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              v-model="editForm.email"
              class="form-input"
              placeholder="Введите email"
            />
          </div>
          <div class="form-group">
            <label>Телефон</label>
            <input
              type="tel"
              v-model="editForm.phone"
              class="form-input"
              placeholder="+7 (XXX) XXX-XX-XX"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeEditModal" class="btn-cancel">Отмена</button>
          <button
            @click="saveProfile"
            class="btn-save"
            :disabled="loading.profile"
          >
            {{ loading.profile ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from 'vue-toastification';
import { orderService } from '@/services/orderService';

export default {
  name: 'ProfilePage',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const toast = useToast();

    const user = ref({ ...authStore.user });
    const showEditModal = ref(false);
    const loading = ref({
      profile: false,
      orders: false,
    });

    const editForm = ref({ ...authStore.user });

    // Заявки
    const orders = ref([]);
    const currentOrder = ref(null);
    const currentStatusFilter = ref('all');

    const statusFilters = [
      { key: 'all', label: 'Все' },
      { key: 'pending', label: 'Ожидание' },
      { key: 'manager_review', label: 'На рассмотрении' },
      { key: 'accepted', label: 'Принята' },
      { key: 'in_progress', label: 'В работе' },
      { key: 'completed', label: 'Завершённые' },
      { key: 'cancelled', label: 'Отменено' },
      { key: 'rejected', label: 'Отклонено' },
    ];

    const progressSteps = [
      { number: 1, label: 'Приём' },
      { number: 2, label: 'Диагностика' },
      { number: 3, label: 'Ремонт' },
      { number: 4, label: 'Тест' },
      { number: 5, label: 'Выдача' },
    ];

    const statusLabels = {
      pending: 'Ожидание',
      manager_review: 'На рассмотрении',
      accepted: 'Принята',
      in_progress: 'В работе',
      completed: 'Завершена',
      cancelled: 'Отменена',
      rejected: 'Отклонена',
    };

    // Настройки
    const notificationsEnabled = ref(true);
    const theme = ref('dark');

    // Вычисляемые свойства
    const filteredOrders = computed(() => {
      if (currentStatusFilter.value === 'all') return orders.value;
      return orders.value.filter((order) => order.status === currentStatusFilter.value);
    });

    // === Методы профиля ===
    const loadUserData = async () => {
      try {
        loading.value.profile = true;
        const profileData = await authStore.getProfile();
        user.value = { ...profileData.user };
        editForm.value = { ...profileData.user };
      } catch (err) {
        console.error('Ошибка загрузки профиля:', err);
        toast.error('Не удалось загрузить профиль');
      } finally {
        loading.value.profile = false;
      }
    };

    const openEditModal = () => {
      editForm.value = { ...user.value };
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      showEditModal.value = false;
    };

    const saveProfile = async () => {
      try {
        loading.value.profile = true;
        await authStore.updateProfile(editForm.value);
        await loadUserData();
        toast.success('Профиль успешно обновлён');
        setTimeout(() => showEditModal.value = false, 1000);
      } catch (err) {
        console.error('Ошибка сохранения профиля:', err);
        toast.error('Ошибка при сохранении профиля');
      } finally {
        loading.value.profile = false;
      }
    };

    const triggerAvatarUpload = () => {
      document.querySelector('input[type="file"]').click();
    };

    const handleImageError = (e) => {
      e.target.src = '/avatar.png';
    };

    const handleAvatarUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        toast.error('Пожалуйста, выберите изображение');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Файл слишком большой (макс. 5MB)');
        return;
      }

      try {
        loading.value.profile = true;
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch('http://localhost:3000/api/users/avatar', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authStore.token}` },
          body: formData,
        });

        const result = await response.json();
        if (result.success) {
          user.value.avatar = result.user.avatar;
          authStore.user.avatar = result.user.avatar;
          localStorage.setItem('user', JSON.stringify(authStore.user));
          toast.success('Фотография успешно обновлена!');
        }
      } catch (err) {
        console.error('Ошибка загрузки аватара:', err);
        toast.error('Ошибка при загрузке фото');
      } finally {
        loading.value.profile = false;
        event.target.value = '';
      }
    };

    // === Методы заявок ===
    const loadUserOrders = async () => {
      try {
        loading.value.orders = true;
        orders.value = await orderService.getOrdersByRole();
        currentOrder.value =
          orders.value.find((order) => order.status === 'in_progress') || orders.value[0] || null;
      } catch (err) {
        console.error('Ошибка загрузки заявок:', err);
        toast.error('Не удалось загрузить заявки');
      } finally {
        loading.value.orders = false;
      }
    };

    const setStatusFilter = (filter) => {
      currentStatusFilter.value = filter;
    };

    const setCurrentOrder = (order) => {
      currentOrder.value = order;
    };

    const viewDetails = (order) => {
      alert(
        `Детали заявки:\n\nУслуга: ${order.service}\nСтатус: ${
          statusLabels[order.status]
        }\nЦена: ${order.price ? order.price + '₽' : 'не указана'}\nПрогресс: ${
          order.progress
        }/5`
      );
    };

    const downloadReport = (order) => {
      alert(`Отчёт по заявке #${order._id} скачивается...`);
    };

    // === Настройки ===
    const loadUserSettings = () => {
      try {
        const saved = localStorage.getItem('userSettings');
        if (saved) {
          const settings = JSON.parse(saved);
          notificationsEnabled.value = settings.notificationsEnabled ?? true;
          theme.value = settings.theme || 'dark';
        }
      } catch (err) {
        console.error('Ошибка загрузки настроек:', err);
      }
    };

    

    // === Прочее ===
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('ru-RU');
    };

    const onLogout = () => {
      if (confirm('Вы уверены, что хотите выйти?')) {
        authStore.logout();
        router.push('/auth');
      }
    };

    // === Инициализация ===
    onMounted(() => {
      if (!authStore.isAuthenticated) {
        router.push('/auth');
        return;
      }
      loadUserData();
      loadUserOrders();
      loadUserSettings();
    });

    return {
      user,
      showEditModal,
      loading,
      editForm,
      filteredOrders,
      currentOrder,
      currentStatusFilter,
      statusFilters,
      progressSteps,
      statusLabels,
      notificationsEnabled,
      theme,
      openEditModal,
      closeEditModal,
      saveProfile,
      triggerAvatarUpload,
      handleAvatarUpload,
      handleImageError,
      setStatusFilter,
      setCurrentOrder,
      viewDetails,
      downloadReport,
      formatDate,
      onLogout,
    };
  },
};
</script>

<style scoped>
.profile-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  margin-top: 100px;
  gap: 24px;
  padding: 0 20px;
}

/* Левая карточка профиля */
.profile-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  padding: 40px 0;
  gap: 25px;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  max-width: 320px;
  text-align: center;
  height: fit-content;
}

.avatar-section {
  position: relative;
  display: inline-block;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 16px;
  border: 3px solid #f5f5f5;
}

.btn-avatar-edit {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: #333;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 14px;
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
  margin-bottom: 6px;
}

.user-phone {
  font-weight: 500;
  color: #333 !important;
}

.status-badge {
  display: inline-block;
  padding: 6px 16px;
  background: #e6f7ee;
  color: #2e7d32;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  margin-top: 8px;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
  width: 100%;
  padding: 0 30px;
}

.btn-edit,
.btn-logout {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-edit {
  background: #f5f5f5;
  color: #2d2d2d;
}

.btn-edit:hover {
  background: #eaeaea;
}

.btn-logout {
  background: #ffebee;
  color: #c62828;
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
  margin: 0;
}

.badge {
  background: #e3f2fd;
  color: #333;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

/* Фильтры заявок */
.orders-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #eaeaea;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #f5f5f5;
}

.filter-btn.active {
  background: #333;
  color: white;
  border-color: #333;
}

.empty-state {
  text-align: center;
  color: #757575;
  padding: 40px 24px;
  font-style: italic;
}

/* Список заявок */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 12px;
  border-left: 4px solid #eaeaea;
  cursor: pointer;
  transition: all 0.2s;
}

.order-item:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
}

.order-item.active-order {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.order-title {
  font-weight: 500;
  color: #2d2d2d;
  font-size: 15px;
}

.order-date {
  font-size: 13px;
  color: #757575;
}

.order-price {
  font-weight: 600;
  color: #2e7d32;
  font-size: 14px;
  margin-top: 4px;
}

.order-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-pending {
  background: #fff3e0;
  color: #fb8c00;
}

.status-in_progress {
  background: #e3f2fd;
  color: #1976d2;
}

.status-completed {
  background: #e6f7ee;
  color: #2e7d32;
}

.status-cancelled {
  background: #ffebee;
  color: #c62828;
}

/* Текущий ремонт */
.current-order-info {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.current-order-info h4 {
  margin: 0 0 8px 0;
  color: #2d2d2d;
  font-size: 16px;
}

.current-order-info p {
  margin: 0;
  color: #757575;
  font-size: 14px;
}

.order-description {
  color: #666;
  font-size: 14px;
  margin-top: 8px !important;
  font-style: italic;
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
  z-index: 1;
}

.step-number {
  width: 32px;
  height: 32px;
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

.progress-step.completed .step-number {
  background: #2e7d32;
  color: white;
}

.progress-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 16px;
  left: 50%;
  width: 190px;
  height: 2px;
  background: #eaeaea;
  z-index: -1;
}

.progress-step.active:not(:last-child)::after,
.progress-step.completed:not(:last-child)::after {
  background: #333;
}

.repair-status {
  text-align: center;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.progress-text {
  font-size: 13px;
  color: #757575;
}

/* Настройки */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  min-width: 120px;
}

/* Переключатель (switch) */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
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
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
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
  padding: 8px 16px;
  background: #f5f5f5;
  color: #2d2d2d;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
  margin-left: 8px;
}

.btn-small:hover {
  background: #eaeaea;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 0;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #757575;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 0 24px;
}

.modal-footer {
  padding: 20px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid #eaeaea;
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #333;
}

.btn-cancel,
.btn-save {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.btn-cancel {
  background: #f5f5f5;
  color: #333;
}

.btn-save {
  background: #333;
  color: white;
}

.btn-cancel:hover {
  background: #eaeaea;
}

.btn-save:hover {
  background: #555;
}

/* Загрузка */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px;
  color: #757575;
  gap: 12px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Адаптив */
@media (max-width: 968px) {
  .profile-container {
    flex-direction: column;
    margin-top: 80px;
    gap: 20px;
  }

  .profile-card {
    max-width: 100%;
    padding: 30px 0;
  }

  .right-column {
    min-width: auto;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .card-header>div {
    align-self: flex-end;
  }
}

@media (max-width: 768px) {
  .profile-container {
    margin-top: 60px;
    padding: 0 15px;
  }

  .orders-filter {
    justify-content: center;
  }

  .filter-btn {
    flex: 1;
    min-width: 0;
    text-align: center;
  }

  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .order-status {
    align-self: flex-end;
  }

  .modal-content {
    margin: 10px;
    width: calc(100% - 20px);
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-save {
    width: 100%;
  }

  .repair-progress {
    flex-wrap: wrap;
    gap: 15px;
    justify-content: center;
  }

  .progress-step:not(:last-child)::after {
    display: none;
  }
}

@media (max-width: 480px) {
  .profile-card {
    padding: 25px 0;
  }

  .profile-actions {
    padding: 0 20px;
  }

  .card {
    padding: 20px;
  }

  .modal-body {
    padding: 0 20px;
  }

  .modal-footer {
    padding: 20px 20px 20px;
  }
}
</style>