<template>
  <div class="panel-page">
    <!-- Hero секция -->
    <section class="page-hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">Панель менеджера</h1>
          <p class="hero-subtitle">
            Управление заявками клиентов и распределение работы
          </p>
        </div>
      </div>
    </section>

    <!-- Статистика -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📋</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.pending }}</div>
              <div class="stat-label">Новые заявки</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👨‍💼</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.inReview }}</div>
              <div class="stat-label">На рассмотрении</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.accepted }}</div>
              <div class="stat-label">Принятые</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">Всего за месяц</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Заявки -->
    <section class="orders-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Заявки на рассмотрение</h2>
          <div class="section-actions">
            <button @click="loadOrders" class="btn btn-outline" :disabled="loading">
              🔄 Обновить
            </button>
          </div>
        </div>

        <!-- Фильтры -->
        <div class="filters-section">
          <div class="filter-buttons">
            <button v-for="filter in filters" :key="filter.key" @click="setFilter(filter.key)"
              :class="['filter-btn', { active: currentFilter === filter.key }]">
              {{ filter.label }}
            </button>
          </div>
        </div>

        <!-- Состояние загрузки -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <span>Загружаем заявки...</span>
        </div>

        <!-- Список заявок -->
        <div v-else class="orders-grid">
          <div v-for="order in filteredOrders" :key="order._id" class="order-card-manager"
            :class="`status-${order.status}`">
            <div class="order-header">
              <div class="order-main">
                <h3 class="order-title">{{ order.service }}</h3>
                <p class="order-description">{{ order.description }}</p>

                <div class="order-client">
                  <div class="client-avatar">👤</div>
                  <div class="client-info">
                    <span class="client-name">
                      {{ order.user?.firstName }} {{ order.user?.lastName }}
                    </span>
                    <span class="client-contact">{{ order.user?.email }}</span>
                    <span class="client-contact" v-if="order.user?.phone">{{ order.user.phone }}</span>
                  </div>
                </div>
              </div>

              <div class="order-meta">
                <div class="order-status-badge" :class="`status-${order.status}`">
                  {{ statusLabels[order.status] }}
                </div>
                <div class="order-date">{{ formatDate(order.createdAt) }}</div>
                <div class="order-id">#{{ order._id.slice(-6) }}</div>
              </div>
            </div>

            <div class="order-details">
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">Устройство:</span>
                  <span class="detail-value">{{ order.deviceType }} {{ order.deviceModel }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Создана:</span>
                  <span class="detail-value">{{ formatDateTime(order.createdAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Действия менеджера -->
            <div class="manager-actions" v-if="order.status === 'pending' || order.status === 'manager_review'">
              <button @click="acceptOrder(order)" class="btn btn-success">
                ✅ Принять
              </button>
              <button @click="rejectOrder(order)" class="btn btn-danger">
                ❌ Отклонить
              </button>
              <button @click="viewOrderDetails(order)" class="btn btn-outline">
                👁️ Подробнее
              </button>
            </div>

            <div class="manager-info" v-if="order.status === 'accepted' || order.status === 'in_progress'">
              <div class="assigned-info">
                <span class="info-label">Назначена мастеру:</span>
                <span class="info-value" v-if="order.assignedMaster">Мастер #{{ order.assignedMaster.slice(-6) }}</span>
                <span class="info-value" v-else>Не назначена</span>
              </div>
              <div class="price-info" v-if="order.price">
                <span class="info-label">Цена:</span>
                <span class="info-value price">{{ order.price }} ₽</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Пустое состояние -->
        <div v-if="!loading && filteredOrders.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>Заявок нет</h3>
          <p>Все заявки обработаны</p>
        </div>
      </div>
    </section>

    <!-- Модальное окно деталей заявки -->
    <div v-if="selectedOrder" class="modal-overlay" @click="selectedOrder = null">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>Детали заявки #{{ selectedOrder._id.slice(-6) }}</h3>
          <button @click="selectedOrder = null" class="close-btn">×</button>
        </div>

        <div class="modal-body">
          <div class="order-detail-grid">
            <div class="detail-section">
              <h4>Информация о клиенте</h4>
              <div class="client-details">
                <div class="client-field">
                  <span class="field-label">Имя:</span>
                  <span class="field-value">{{ selectedOrder.user?.firstName }} {{ selectedOrder.user?.lastName
                    }}</span>
                </div>
                <div class="client-field">
                  <span class="field-label">Email:</span>
                  <span class="field-value">{{ selectedOrder.user?.email }}</span>
                </div>
                <div class="client-field" v-if="selectedOrder.user?.phone">
                  <span class="field-label">Телефон:</span>
                  <span class="field-value">{{ selectedOrder.user.phone }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4>Информация об устройстве</h4>
              <div class="device-details">
                <div class="device-field">
                  <span class="field-label">Тип:</span>
                  <span class="field-value">{{ selectedOrder.deviceType }}</span>
                </div>
                <div class="device-field">
                  <span class="field-label">Модель:</span>
                  <span class="field-value">{{ selectedOrder.deviceModel }}</span>
                </div>
                <div class="device-field">
                  <span class="field-label">Услуга:</span>
                  <span class="field-value">{{ selectedOrder.service }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section full-width">
              <h4>Описание проблемы</h4>
              <div class="description-box">
                {{ selectedOrder.description }}
              </div>
            </div>

            <div class="detail-section">
              <h4>История статусов</h4>
              <div class="status-history">
                <div v-for="history in selectedOrder.statusHistory" :key="history.timestamp" class="history-item">
                  <span class="history-status">{{ statusLabels[history.status] }}</span>
                  <span class="history-date">{{ formatDateTime(history.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { orderService } from '@/services/orderService'

export default {
  name: 'ManagerPanel',

  setup() {
    const authStore = useAuthStore()
    const orders = ref([])
    const loading = ref(false)
    const selectedOrder = ref(null)
    const currentFilter = ref('pending')

    const filters = [
      { key: 'pending', label: 'Новые' },
      { key: 'manager_review', label: 'На рассмотрении' },
      { key: 'accepted', label: 'Принятые' },
      { key: 'in_progress', label: 'В работе' },
      { key: 'all', label: 'Все' }
    ]

    const statusLabels = {
      pending: 'Ожидает',
      manager_review: 'На рассмотрении',
      accepted: 'Принята',
      in_progress: 'В работе',
      completed: 'Завершена',
      cancelled: 'Отменена',
      rejected: 'Отклонена'
    }

    // Загрузка заявок
    const loadOrders = async () => {
      try {
        loading.value = true
        const response = await orderService.getMyOrders()
        orders.value = response
      } catch (error) {
        console.error('Ошибка загрузки заявок:', error)
        alert('Ошибка загрузки заявок')
      } finally {
        loading.value = false
      }
    }

    // Принять заявку
    const acceptOrder = async (order) => {
      try {
        await orderService.acceptOrder(order._id)
        await loadOrders()
        alert('Заявка принята в работу')
      } catch (error) {
        alert('Ошибка: ' + error.message)
      }
    }

    // Отклонить заявку
    const rejectOrder = async (order) => {
      if (confirm('Вы уверены, что хотите отклонить эту заявку?')) {
        try {
          await orderService.rejectOrder(order._id)
          await loadOrders()
          alert('Заявка отклонена')
        } catch (error) {
          alert('Ошибка: ' + error.message)
        }
      }
    }

    // Просмотр деталей заявки
    const viewOrderDetails = (order) => {
      selectedOrder.value = order
    }

    // Фильтрация заявок
    const filteredOrders = computed(() => {
      if (currentFilter.value === 'all') {
        return orders.value
      }
      return orders.value.filter(order => order.status === currentFilter.value)
    })

    // Статистика
    const stats = computed(() => {
      return {
        pending: orders.value.filter(o => o.status === 'pending').length,
        inReview: orders.value.filter(o => o.status === 'manager_review').length,
        accepted: orders.value.filter(o => o.status === 'accepted').length,
        total: orders.value.length
      }
    })

    const setFilter = (filter) => {
      currentFilter.value = filter
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ru-RU')
    }

    const formatDateTime = (dateString) => {
      return new Date(dateString).toLocaleString('ru-RU')
    }

    onMounted(() => {
      if (authStore.userRole !== 'manager' && authStore.userRole !== 'admin') {
        alert('Доступ запрещен')
        return
      }
      loadOrders()
    })

    return {
      orders,
      loading,
      selectedOrder,
      currentFilter,
      filters,
      statusLabels,
      stats,
      filteredOrders,
      loadOrders,
      acceptOrder,
      rejectOrder,
      viewOrderDetails,
      setFilter,
      formatDate,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.panel-page {
  background: #f8f9fa;
  min-height: 100vh;
}

/* Hero секция */
.page-hero {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  padding: 4rem 0 3rem;
}

.hero-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 300;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
}

/* Статистика */
.stats-section {
  padding: 3rem 0;
  background: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 2rem;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  font-size: 3rem;
  margin-right: 1.5rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

/* Секция заявок */
.orders-section {
  padding: 3rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 300;
  color: #1a1a1a;
}

/* Заявки менеджера */
.orders-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card-manager {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.order-card-manager:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 2rem;
}

.order-main {
  flex: 1;
}

.order-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.order-description {
  color: #666;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.order-client {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.client-avatar {
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.client-info {
  display: flex;
  flex-direction: column;
}

.client-name {
  font-weight: 600;
  color: #1a1a1a;
}

.client-contact {
  font-size: 0.9rem;
  color: #666;
}

.order-meta {
  text-align: right;
  flex-shrink: 0;
}

.order-status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-manager_review {
  background: #cce7ff;
  color: #004085;
}

.status-accepted {
  background: #d4edda;
  color: #155724;
}

.status-in_progress {
  background: #d1ecf1;
  color: #0c5460;
}

.order-date {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.order-id {
  font-size: 0.8rem;
  color: #999;
}

/* Детали заявки */
.order-details {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-row {
  display: flex;
  gap: 3rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.9rem;
  color: #666;
}

.detail-value {
  font-weight: 500;
  color: #1a1a1a;
}

/* Действия менеджера */
.manager-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-success {
  background: #28a745;
  color: white;
  border: none;
}

.btn-success:hover {
  background: #218838;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
}

.btn-danger:hover {
  background: #c82333;
}

/* Информация о назначении */
.manager-info {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.assigned-info,
.price-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.9rem;
  color: #666;
}

.info-value {
  font-weight: 500;
  color: #1a1a1a;
}

.info-value.price {
  color: #28a745;
  font-weight: 600;
}

/* Модальное окно */
.modal-content.large {
  max-width: 800px;
}

.order-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.detail-section {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-section.full-width {
  grid-column: 1 / -1;
}

.detail-section h4 {
  margin: 0 0 1rem 0;
  color: #1a1a1a;
  font-size: 1.1rem;
}

.client-field,
.device-field {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.field-label {
  font-weight: 500;
  color: #666;
}

.field-value {
  color: #1a1a1a;
}

.description-box {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  line-height: 1.5;
}

.status-history {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.history-status {
  font-weight: 500;
}

.history-date {
  color: #666;
  font-size: 0.9rem;
}

/* Адаптивность */
@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    gap: 1rem;
  }

  .order-meta {
    text-align: left;
  }

  .detail-row {
    flex-direction: column;
    gap: 1rem;
  }

  .manager-actions {
    flex-direction: column;
  }

  .order-detail-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>