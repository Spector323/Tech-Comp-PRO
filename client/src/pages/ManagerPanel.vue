<template>
  <div class="panel-page">
    <!-- Hero секция -->
    <section class="page-hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            <i class="pi pi-id-card"></i>
            Панель менеджера
          </h1>
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
            <div class="stat-info">
              <i class="pi pi-inbox" style="font-size: 2.5rem"></i>
              <div class="stat-number">{{ stats.pending }}</div>
            </div>
            <div class="stat-label">Новые заявки</div>
          </div>
          <div class="stat-card">
            <div class="stat-info">
              <i class="pi pi-eye" style="font-size: 2.5rem"></i>
              <div class="stat-number">{{ stats.inReview }}</div>
            </div>
            <div class="stat-label">На рассмотрении</div>
          </div>
          <div class="stat-card">
            <div class="stat-info">
              <i class="pi pi-check-circle" style="font-size: 2.5rem"></i>
              <div class="stat-number">{{ stats.accepted }}</div>
            </div>
            <div class="stat-label">Принятые</div>
          </div>
          <div class="stat-card">
            <div class="stat-info">
              <i class="pi pi-chart-bar" style="font-size: 2.5rem"></i>
              <div class="stat-number">{{ stats.total }}</div>
            </div>
            <div class="stat-label">Всего за месяц</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Заявки -->
    <section class="orders-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            <i class="pi pi-list"></i>
            Заявки на рассмотрение
          </h2>
          <div class="section-actions">
            <button @click="loadOrders" class="btn btn-outline" :disabled="loading">
              <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
              Обновить
            </button>
            <input v-model="searchQuery" type="text" placeholder="Поиск заявок..." class="search-input" />
          </div>
        </div>

        <!-- Фильтры -->
        <div class="filters-section">
          <div class="filter-buttons">
            <button v-for="filter in filters" :key="filter.key" @click="setFilter(filter.key)"
              :class="['filter-btn', { active: currentFilter === filter.key }]">
              <i :class="filter.icon"></i>
              {{ filter.label }}
            </button>
          </div>
        </div>

        <!-- Состояние загрузки -->
        <div v-if="loading" class="loading-state">
          <div class="spinner">
            <i class="pi pi-spinner pi-spin" style="font-size: 2rem"></i>
          </div>
          <span>Загружаем заявки...</span>
        </div>

        <!-- Список заявок -->
        <div v-else class="orders-container">
          <div class="orders-grid">
            <div v-for="order in filteredOrders" :key="order._id" class="order-card" :class="`status-${order.status}`">
              <div class="order-header">
                <div class="order-main">
                  <h3 class="order-title">
                    <i class="pi pi-tag"></i>
                    {{ order.service }}
                  </h3>
                  <p class="order-description">{{ order.description }}</p>

                  <div class="order-client">
                    <div class="client-avatar">
                      <i class="pi pi-user"></i>
                    </div>
                    <div class="client-info">
                      <span class="client-name">
                        {{ order.user?.firstName }} {{ order.user?.lastName }}
                      </span>
                      <span class="client-contact">
                        <i class="pi pi-envelope"></i>
                        {{ order.user?.email }}
                      </span>
                      <span class="client-contact" v-if="order.user?.phone">
                        <i class="pi pi-phone"></i>
                        {{ order.user.phone }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="order-meta">
                  <div class="order-status-badge" :class="`status-${order.status}`">
                    <i :class="getStatusIcon(order.status)"></i>
                    {{ statusLabels[order.status] }}
                  </div>
                  <div class="order-date">
                    <i class="pi pi-calendar"></i>
                    {{ formatDate(order.createdAt) }}
                  </div>
                  <div class="order-id">
                    <i class="pi pi-hashtag"></i>
                    #{{ order._id.slice(-6) }}
                  </div>
                </div>
              </div>

              <div class="order-details">
                <div class="detail-row">
                  <div class="detail-item">
                    <span class="detail-label">
                      <i class="pi pi-desktop"></i>
                      Устройство:
                    </span>
                    <span class="detail-value">{{ order.deviceType }} {{ order.deviceModel }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">
                      <i class="pi pi-clock"></i>
                      Создана:
                    </span>
                    <span class="detail-value">{{ formatDateTime(order.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- Действия менеджера -->
              <div class="manager-actions" v-if="order.status === 'pending' || order.status === 'manager_review'">
                <button @click="acceptOrder(order)" class="btn btn-success">
                  <i class="pi pi-check"></i>
                  Принять
                </button>
                <button @click="rejectOrder(order)" class="btn btn-danger">
                  <i class="pi pi-times"></i>
                  Отклонить
                </button>
                <button @click="assignToMaster(order)" class="btn btn-primary">
                  <i class="pi pi-user-plus"></i>
                  Назначить мастеру
                </button>
                <button @click="viewOrderDetails(order)" class="btn btn-outline">
                  <i class="pi pi-eye"></i>
                  Подробнее
                </button>
              </div>

              <div class="manager-info" v-if="order.status === 'accepted' || order.status === 'in_progress'">
                <div class="assigned-info">
                  <span class="info-label">
                    <i class="pi pi-user"></i>
                    Назначена мастеру:
                  </span>
                  <span class="info-value" v-if="order.assignedMaster">
                    <i class="pi pi-wrench"></i>
                    Мастер #{{ order.assignedMaster.slice(-6) }}
                  </span>
                  <span class="info-value" v-else>Не назначена</span>
                </div>
                <div class="price-info" v-if="order.price">
                  <span class="info-label">
                    <i class="pi pi-money-bill"></i>
                    Цена:
                  </span>
                  <span class="info-value price">{{ order.price }} ₽</span>
                </div>
                <div class="progress-info" v-if="order.status === 'in_progress'">
                  <span class="info-label">
                    <i class="pi pi-cog"></i>
                    Статус ремонта:
                  </span>
                  <span class="info-value">В работе</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Пустое состояние -->
        <div v-if="!loading && filteredOrders.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="pi pi-inbox" style="font-size: 4rem"></i>
          </div>
          <h3>Заявок нет</h3>
          <p>Все заявки обработаны или попробуйте изменить фильтры</p>
        </div>
      </div>
    </section>

    <!-- Модальное окно деталей заявки -->
    <div v-if="selectedOrder" class="modal-overlay" @click="selectedOrder = null">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="pi pi-file"></i>
            Детали заявки #{{ selectedOrder._id.slice(-6) }}
          </h3>
          <button @click="selectedOrder = null" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="order-detail-grid">
            <div class="detail-section">
              <h4>
                <i class="pi pi-user"></i>
                Информация о клиенте
              </h4>
              <div class="client-details">
                <div class="client-field">
                  <span class="field-label">Имя:</span>
                  <span class="field-value">{{ selectedOrder.user?.firstName }} {{ selectedOrder.user?.lastName }}</span>
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
              <h4>
                <i class="pi pi-mobile"></i>
                Информация об устройстве
              </h4>
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
              <h4>
                <i class="pi pi-file-edit"></i>
                Описание проблемы
              </h4>
              <div class="description-box">
                {{ selectedOrder.description }}
              </div>
            </div>

            <div class="detail-section">
              <h4>
                <i class="pi pi-history"></i>
                История статусов
              </h4>
              <div class="status-history">
                <div v-for="history in selectedOrder.statusHistory" :key="history.timestamp" class="history-item">
                  <span class="history-status">
                    <i :class="getStatusIcon(history.status)"></i>
                    {{ statusLabels[history.status] }}
                  </span>
                  <span class="history-date">{{ formatDateTime(history.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer" v-if="selectedOrder.status === 'pending' || selectedOrder.status === 'manager_review'">
          <button @click="acceptOrder(selectedOrder)" class="btn btn-success">
            <i class="pi pi-check"></i>
            Принять заявку
          </button>
          <button @click="rejectOrder(selectedOrder)" class="btn btn-danger">
            <i class="pi pi-times"></i>
            Отклонить заявку
          </button>
          <button @click="selectedOrder = null" class="btn btn-outline">
            <i class="pi pi-times"></i>
            Закрыть
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно назначения мастеру -->
    <div v-if="showAssignModal" class="modal-overlay" @click="showAssignModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="pi pi-user-plus"></i>
            Назначить заявку мастеру
          </h3>
          <button @click="showAssignModal = false" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Выберите мастера для заявки #{{ selectedOrder?._id?.slice(-6) }}</p>
          <div class="masters-list">
            <div v-for="master in availableMasters" :key="master._id" class="master-item" @click="assignMaster(master)">
              <div class="master-avatar">
                <i class="pi pi-user"></i>
              </div>
              <div class="master-info">
                <span class="master-name">{{ master.firstName }} {{ master.lastName }}</span>
                <span class="master-specialization">{{ master.specialization || 'Общая специализация' }}</span>
              </div>
              <div class="master-stats">
                <span class="stat">Заявок: {{ master.activeOrders || 0 }}</span>
                <span class="rating" v-if="master.rating">
                  <i class="pi pi-star"></i> {{ master.rating }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showAssignModal = false" class="btn btn-outline">
            <i class="pi pi-times"></i>
            Отмена
          </button>
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
    const showAssignModal = ref(false)
    const currentFilter = ref('pending')
    const searchQuery = ref('')

    const filters = [
      { key: 'pending', label: 'Новые', icon: 'pi pi-inbox' },
      { key: 'manager_review', label: 'На рассмотрении', icon: 'pi pi-eye' },
      { key: 'accepted', label: 'Принятые', icon: 'pi pi-check' },
      { key: 'in_progress', label: 'В работе', icon: 'pi pi-cog' },
      { key: 'all', label: 'Все заявки', icon: 'pi pi-list' }
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

    const getStatusIcon = (status) => {
      const icons = {
        pending: 'pi pi-clock',
        manager_review: 'pi pi-eye',
        accepted: 'pi pi-check',
        in_progress: 'pi pi-cog',
        completed: 'pi pi-check-circle',
        cancelled: 'pi pi-times-circle',
        rejected: 'pi pi-ban'
      }
      return icons[status] || 'pi pi-question-circle'
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
        selectedOrder.value = null
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
          selectedOrder.value = null
          alert('Заявка отклонена')
        } catch (error) {
          alert('Ошибка: ' + error.message)
        }
      }
    }

    // Назначить мастеру
    const assignToMaster = (order) => {
      selectedOrder.value = order
      showAssignModal.value = true
    }

    const assignMaster = async (master) => {
      try {
        await orderService.assignToMaster(selectedOrder.value._id, master._id)
        await loadOrders()
        showAssignModal.value = false
        selectedOrder.value = null
        alert(`Заявка назначена мастеру ${master.firstName} ${master.lastName}`)
      } catch (error) {
        alert('Ошибка назначения: ' + error.message)
      }
    }

    // Просмотр деталей заявки
    const viewOrderDetails = (order) => {
      selectedOrder.value = order
    }

    // Фильтрация заявок
    const filteredOrders = computed(() => {
      let filtered = orders.value

      if (currentFilter.value !== 'all') {
        filtered = filtered.filter(order => order.status === currentFilter.value)
      }

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(order =>
          order.service.toLowerCase().includes(query) ||
          order.description.toLowerCase().includes(query) ||
          order.deviceType.toLowerCase().includes(query) ||
          order.deviceModel.toLowerCase().includes(query) ||
          (order.user?.firstName?.toLowerCase().includes(query)) ||
          (order.user?.lastName?.toLowerCase().includes(query)) ||
          (order.user?.email?.toLowerCase().includes(query))
        )
      }

      return filtered
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

    // Доступные мастера (заглушка)
    const availableMasters = computed(() => {
      return [
        {
          _id: '1',
          firstName: 'Алексей',
          lastName: 'Иванов',
          specialization: 'Ноутбуки',
          activeOrders: 3,
          rating: 4.8
        },
        {
          _id: '2',
          firstName: 'Дмитрий',
          lastName: 'Петров',
          specialization: 'Смартфоны',
          activeOrders: 2,
          rating: 4.9
        },
        {
          _id: '3',
          firstName: 'Сергей',
          lastName: 'Сидоров',
          specialization: 'Компьютеры',
          activeOrders: 1,
          rating: 4.7
        }
      ]
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
      showAssignModal,
      currentFilter,
      searchQuery,
      filters,
      statusLabels,
      stats,
      filteredOrders,
      availableMasters,
      loadOrders,
      acceptOrder,
      rejectOrder,
      assignToMaster,
      assignMaster,
      viewOrderDetails,
      setFilter,
      formatDate,
      formatDateTime,
      getStatusIcon
    }
  }
}
</script>

<style scoped>
/* Общие стили панели */
.panel-page {
  background: #f8f9fa;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero секция */
.page-hero {
  background: linear-gradient(135deg, #333 0%, #666 100%);
  color: white;
  padding: 4rem 0 3rem;
  position: relative;
  overflow: hidden;
}

.page-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.hero-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  line-height: 1.6;
  font-weight: 300;
}

/* Статистика */
.stats-section {
  padding: 3rem 0;
  background: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent-color, #333);
}

.stat-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
}

.stat-label {
  color: #666;
  font-size: 0.95rem;
  font-weight: 500;
  text-align: center;
}

/* Секция заявок */
.orders-section {
  padding: 3rem 0;
  background: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input {
  padding: 0.75rem 1rem;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  font-size: 0.9rem;
  min-width: 250px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #333;
}

/* Фильтры */
.filters-section {
  margin-bottom: 2rem;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-btn:hover {
  border-color: #333;
  color: #333;
}

.filter-btn.active {
  background: #333;
  border-color: #333;
  color: white;
}

/* Контейнер заявок */
.orders-container {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.orders-grid {
  display: flex;
  flex-direction: column;
}

/* Карточка заявки */
.order-card {
  padding: 2rem;
  border-bottom: 1px solid #f8f9fa;
  transition: all 0.3s ease;
  position: relative;
}

.order-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  border-radius: 4px 0 0 4px;
  background: var(--status-color, #6c757d);
}



.order-card:last-child {
  border-bottom: none;
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
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.order-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.order-client {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.client-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #333, #666);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.client-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.client-name {
  font-weight: 600;
  color: #1a1a1a;
}

.client-contact {
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.order-meta {
  text-align: right;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.order-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  gap: 0.25rem;
}

.status-pending { 
  background: #fff3cd; 
  color: #856404;
  --status-color: #ffc107;
}
.status-manager_review { 
  background: #cce7ff; 
  color: #004085;
  --status-color: #007bff;
}
.status-accepted { 
  background: #d4edda; 
  color: #155724;
  --status-color: #28a745;
}
.status-in_progress { 
  background: #d1ecf1; 
  color: #0c5460;
  --status-color: #17a2b8;
}

.order-date,
.order-id {
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Детали заявки */
.order-details {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #333;
}

.detail-row {
  display: flex;
  gap: 3rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.detail-value {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 1rem;
}

/* Действия менеджера */
.manager-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Информация о назначении */
.manager-info {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  gap: 3rem;
  flex-wrap: wrap;
  border-left: 4px solid #28a745;
}

.assigned-info,
.price-info,
.progress-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.info-value {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 1rem;
}

.info-value.price {
  color: #28a745;
  font-weight: 700;
  font-size: 1.1rem;
}

/* Кнопки */
.btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid;
  background: transparent;
  color: #1a1a1a;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #333;
  border-color: #333;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
  border-color: #5a6fd8;
}

.btn-success {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
  border-color: #059669;
}

.btn-danger {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
  border-color: #dc2626;
}

.btn-outline {
  background: transparent;
  border-color: #333;
  color: #333;
}

.btn-outline:hover {
  background: #333;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Состояния */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  color: #666;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.empty-icon {
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.empty-state p {
  margin: 0;
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
  padding: 2rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #333;
}

.modal-body {
  padding: 1rem 2rem 2rem;
}

.modal-footer {
  padding: 1rem 2rem 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
}

/* Детали заявки в модалке */
.order-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.detail-section {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #333;
}

.detail-section.full-width {
  grid-column: 1 / -1;
}

.detail-section h4 {
  margin: 0 0 1rem 0;
  color: #1a1a1a;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.client-field,
.device-field {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e9ecef;
}

.client-field:last-child,
.device-field:last-child {
  border-bottom: none;
}

.field-label {
  font-weight: 600;
  color: #666;
}

.field-value {
  color: #1a1a1a;
  font-weight: 500;
}

.description-box {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  line-height: 1.6;
  font-size: 0.95rem;
}

.status-history {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.history-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.history-status {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.history-date {
  color: #666;
  font-size: 0.9rem;
}

/* Список мастеров */
.masters-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.master-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.master-item:hover {
  background: #e9ecef;
  border-color: #333;
}

.master-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #333, #666);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.master-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.master-name {
  font-weight: 600;
  color: #1a1a1a;
}

.master-specialization {
  font-size: 0.9rem;
  color: #666;
}

.master-stats {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-end;
}

.master-stats .stat {
  font-size: 0.8rem;
  color: #666;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #f59e0b;
  font-weight: 600;
}

/* Адаптивность */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .hero-title {
    font-size: 2rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .section-actions {
    flex-direction: column;
  }

  .search-input {
    min-width: auto;
  }

  .order-header {
    flex-direction: column;
    gap: 1rem;
  }

  .order-meta {
    align-items: flex-start;
    text-align: left;
  }

  .detail-row {
    flex-direction: column;
    gap: 1rem;
  }

  .manager-actions {
    flex-direction: column;
  }

  .manager-info {
    flex-direction: column;
    gap: 1.5rem;
  }

  .order-detail-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 1rem;
    width: calc(100% - 2rem);
  }

  .modal-footer {
    flex-direction: column;
  }

  .master-item {
    flex-direction: column;
    text-align: center;
  }

  .master-stats {
    align-items: center;
  }
}

/* Анимации */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.order-card {
  animation: fadeIn 0.5s ease;
}

.stat-card {
  animation: fadeIn 0.6s ease;
}

/* Кастомный скроллбар */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>