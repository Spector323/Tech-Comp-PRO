<template>
  <div class="orders-page">
    <!-- Hero секция -->
    <section class="page-hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">Мои заявки</h1>
          <p class="hero-subtitle">
            Управляйте вашими заявками на ремонт и отслеживайте их статус
          </p>
        </div>
      </div>
    </section>

    <!-- Основной контент -->
    <section class="orders-content">
      <div class="container">
        <!-- Фильтры и статистика -->
        <div class="orders-header">
          <div class="stats-cards">
            <div class="stat-card">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">Всего заявок</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.active }}</div>
              <div class="stat-label">Активные</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.completed }}</div>
              <div class="stat-label">Завершённые</div>
            </div>
          </div>

          <button @click="openCreateModal" class="btn btn-primary new-order-btn">
            <span>+ Новая заявка</span>
          </button>
          <button @click="editOrder(order)" class="btn btn-primary edit-order-btn">✏️ Редактировать</button>
          <button @click="deleteOrder(order)" class="btn btn-primary delete-order-btn">🗑️ Удалить</button>
        </div>

        <!-- Фильтры -->
        <div class="filters-section">
          <div class="filter-buttons">
            <button v-for="filter in filters" :key="filter.key" @click="setFilter(filter.key)"
              :class="['filter-btn', { active: currentFilter === filter.key }]">
              {{ filter.label }}
            </button>
          </div>

          <div class="search-box">
            <input v-model="searchQuery" type="text" placeholder="Поиск по услуге или описанию..." class="search-input">
          </div>
        </div>

        <!-- Состояние загрузки -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <span>Загружаем ваши заявки...</span>
        </div>

        <!-- Состояние пустого списка -->
        <div v-else-if="filteredOrders.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>Заявок пока нет</h3>
          <p>Создайте первую заявку на ремонт</p>
          <button @click="createNewOrder" class="btn btn-primary">
            Создать заявку
          </button>
        </div>

        <!-- Список заявок -->
        <div v-else class="orders-list">
          <div v-for="order in filteredOrders" :key="order.id" class="order-card" :class="`status-${order.status}`">
            <div class="order-header">
              <div class="order-info">
                <h3 class="order-title">{{ order.service }}</h3>
                <p class="order-description">{{ order.description }}</p>
                <div class="order-meta">
                  <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                  <span class="order-id">#{{ order.id }}</span>
                </div>
              </div>

              <div class="order-status">
                <span class="status-badge" :class="`status-${order.status}`">
                  {{ statusLabels[order.status] }}
                </span>
                <div class="order-price" v-if="order.price">
                  {{ order.price }} ₽
                </div>
              </div>
            </div>

            <!-- Прогресс ремонта -->
            <div class="repair-progress" v-if="order.status === 'in_progress'">
              <div class="progress-label">Прогресс ремонта:</div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${(order.progress / 5) * 100}%` }"></div>
              </div>
              <div class="progress-steps">
                <div v-for="step in progressSteps" :key="step.number" class="progress-step" :class="{
                  active: order.progress >= step.number,
                  completed: order.progress > step.number
                }">
                  <div class="step-dot"></div>
                  <span class="step-label">{{ step.label }}</span>
                </div>
              </div>
            </div>

            <!-- Детали заявки -->
            <div class="order-details">
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">Устройство:</span>
                  <span class="detail-value">{{ order.deviceType }} {{ order.deviceModel }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Ориентировочная готовность:</span>
                  <span class="detail-value">
                    {{ order.estimatedCompletion ? formatDate(order.estimatedCompletion) : 'уточняется' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Действия -->
            <div class="order-actions">
              <button @click="viewOrderDetails(order)" class="btn btn-outline">
                Подробнее
              </button>
              <button v-if="order.status === 'completed'" @click="downloadReport(order)" class="btn btn-outline">
                Скачать отчёт
              </button>
              <button v-if="order.status === 'pending'" @click="cancelOrder(order)" class="btn btn-cancel">
                Отменить
              </button>
            </div>
          </div>
        </div>

        <!-- Пагинация -->
        <div v-if="filteredOrders.length > 0" class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn">
            ← Назад
          </button>

          <span class="pagination-info">
            Страница {{ currentPage }} из {{ totalPages }}
          </span>

          <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">
            Вперед →
          </button>
        </div>
      </div>
    </section>

    <!-- Модальное окно создания заявки -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Новая заявка на ремонт</h3>
          <button @click="closeCreateModal" class="close-btn">×</button>
        </div>

        <form @submit.prevent="submitNewOrder" class="modal-form">
          <div class="form-group">
            <label>Тип устройства *</label>
            <select v-model="newOrder.deviceType" required class="form-input">
              <option value="">Выберите тип устройства</option>
              <option value="Ноутбук">Ноутбук</option>
              <option value="Смартфон">Смартфон</option>
              <option value="Компьютер">Компьютер</option>
              <option value="Планшет">Планшет</option>
              <option value="Игровая консоль">Игровая консоль</option>
              <option value="Другое">Другое</option>
            </select>
          </div>

          <div class="form-group">
            <label>Модель устройства *</label>
            <input v-model="newOrder.deviceModel" type="text" required
              placeholder="Например: MacBook Pro 16, iPhone 15 Pro" class="form-input">
          </div>

          <div class="form-group">
            <label>Услуга *</label>
            <select v-model="form.service" required class="form-input">
              <option value="">Выберите услугу</option>
              <option value="Диагностика">Диагностика</option>
              <option value="Замена дисплея">Замена дисплея</option>
              <option value="Замена аккумулятора">Замена аккумулятора</option>
              <option value="Ремонт материнской платы">Ремонт материнской платы</option>
              <option value="Чистка от пыли">Чистка от пыли</option>
              <option value="Восстановление данных">Восстановление данных</option>
              <option value="Установка ПО">Установка ПО</option>
              <option value="Другое">Другое</option>
            </select>
          </div>

          <div class="form-group">
            <label>Описание проблемы *</label>
            <textarea v-model="form.description" required placeholder="Подробно опишите проблему с устройством..."
              rows="4" class="form-input"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeCreateModal" class="btn btn-outline">
              Отмена
            </button>
            <button type="submit" :disabled="creatingOrder" class="btn btn-primary">
              {{ creatingOrder ? 'Создание...' : 'Создать заявку' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'OrdersPage',

  setup() {
    const authStore = useAuthStore()

    const orders = ref([])
    const loading = ref(true)
    const creatingOrder = ref(false)
    const showCreateModal = ref(false)
    const currentFilter = ref('all')
    const searchQuery = ref('')
    const currentPage = ref(1)
    const itemsPerPage = ref(5)

    const filters = [
      { key: 'all', label: 'Все заявки' },
      { key: 'pending', label: 'Ожидание' },
      { key: 'in_progress', label: 'В работе' },
      { key: 'completed', label: 'Завершённые' },
      { key: 'cancelled', label: 'Отменённые' }
    ]

    const statusLabels = {
      pending: 'Ожидает',
      in_progress: 'В работе',
      completed: 'Готово',
      cancelled: 'Отменено'
    }

    const progressSteps = [
      { number: 1, label: 'Приём' },
      { number: 2, label: 'Диагностика' },
      { number: 3, label: 'Ремонт' },
      { number: 4, label: 'Тестирование' },
      { number: 5, label: 'Выдача' }
    ]

    const newOrder = ref({
      deviceType: '',
      deviceModel: '',
      service: '',
      description: ''
    })

    // Загрузка заявок
    const loadOrders = async () => {
      try {
        loading.value = true
        console.log('Загружаем заявки...')

        // Имитация загрузки с API
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Моковые данные заявок
        orders.value = [
          {
            id: 1,
            service: 'Замена дисплея',
            description: 'Треснул экран после падения',
            deviceType: 'Смартфон',
            deviceModel: 'iPhone 15 Pro',
            status: 'completed',
            progress: 5,
            price: 12000,
            createdAt: '2024-01-15T10:00:00',
            estimatedCompletion: '2024-01-17T18:00:00'
          },
          {
            id: 2,
            service: 'Чистка от пыли',
            description: 'Сильно греется и шумит',
            deviceType: 'Ноутбук',
            deviceModel: 'MacBook Pro 16',
            status: 'in_progress',
            progress: 3,
            price: 3000,
            createdAt: '2024-01-18T14:30:00',
            estimatedCompletion: '2024-01-20T17:00:00'
          },
          {
            id: 3,
            service: 'Диагностика',
            description: 'Не включается после попадания жидкости',
            deviceType: 'Ноутбук',
            deviceModel: 'ASUS ROG Strix',
            status: 'pending',
            progress: 1,
            price: 0,
            createdAt: '2024-01-19T09:15:00'
          },
          {
            id: 4,
            service: 'Ремонт материнской платы',
            description: 'Не работает USB-C порт',
            deviceType: 'Ноутбук',
            deviceModel: 'Dell XPS 13',
            status: 'completed',
            progress: 5,
            price: 8000,
            createdAt: '2024-01-10T11:20:00',
            estimatedCompletion: '2024-01-12T16:30:00'
          },
          {
            id: 5,
            service: 'Замена аккумулятора',
            description: 'Быстро разряжается',
            deviceType: 'Смартфон',
            deviceModel: 'Samsung Galaxy S23',
            status: 'cancelled',
            progress: 1,
            price: 5000,
            createdAt: '2024-01-17T16:45:00'
          }
        ]

        console.log('Заявки загружены:', orders.value.length)
      } catch (error) {
        console.error('Ошибка загрузки заявок:', error)
      } finally {
        loading.value = false
      }
    }

    // Компьютед свойства
    const filteredOrders = computed(() => {
      let filtered = orders.value

      // Фильтрация по статусу
      if (currentFilter.value !== 'all') {
        filtered = filtered.filter(order => order.status === currentFilter.value)
      }

      // Поиск
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(order =>
          order.service.toLowerCase().includes(query) ||
          order.description.toLowerCase().includes(query) ||
          order.deviceModel.toLowerCase().includes(query)
        )
      }

      return filtered
    })

    const paginatedOrders = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredOrders.value.slice(start, end)
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredOrders.value.length / itemsPerPage.value)
    })

    const stats = computed(() => {
      const total = orders.value.length
      const active = orders.value.filter(order =>
        order.status === 'pending' || order.status === 'in_progress'
      ).length
      const completed = orders.value.filter(order =>
        order.status === 'completed'
      ).length

      return { total, active, completed }
    })

    // Методы
    const setFilter = (filter) => {
      currentFilter.value = filter
      currentPage.value = 1
    }

    const createNewOrder = () => {
      showCreateModal.value = true
    }

    const closeCreateModal = () => {
      showCreateModal.value = false
      // Сброс формы
      newOrder.value = {
        deviceType: '',
        deviceModel: '',
        service: '',
        description: ''
      }
    }

    const submitNewOrder = async () => {
      try {
        creatingOrder.value = true

        // Имитация создания заявки через API
        await new Promise(resolve => setTimeout(resolve, 1000))

        const order = {
          id: Date.now(),
          ...newOrder.value,
          status: 'pending',
          progress: 1,
          price: 0,
          createdAt: new Date().toISOString()
        }

        orders.value.unshift(order)
        closeCreateModal()

        alert('Заявка успешно создана!')
      } catch (error) {
        console.error('Ошибка создания заявки:', error)
        alert('Ошибка при создании заявки')
      } finally {
        creatingOrder.value = false
      }
    }

    const viewOrderDetails = (order) => {
      alert(`Детали заявки #${order.id}\n\nУслуга: ${order.service}\nУстройство: ${order.deviceType} ${order.deviceModel}\nСтатус: ${statusLabels[order.status]}`)
    }

    const downloadReport = (order) => {
      alert(`Отчёт по заявке #${order.id} скачивается...`)
    }

    const cancelOrder = (order) => {
      if (confirm('Вы уверены, что хотите отменить эту заявку?')) {
        order.status = 'cancelled'
        alert('Заявка отменена')
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    // Загрузка данных при монтировании
    onMounted(() => {
      console.log('Orders mounted, auth:', authStore.isAuthenticated)
      loadOrders()
    })

    return {
      orders: paginatedOrders,
      loading,
      creatingOrder,
      showCreateModal,
      currentFilter,
      searchQuery,
      currentPage,
      totalPages,
      filters,
      statusLabels,
      progressSteps,
      newOrder,
      stats,
      filteredOrders: paginatedOrders,
      setFilter,
      createNewOrder,
      closeCreateModal,
      submitNewOrder,
      viewOrderDetails,
      downloadReport,
      cancelOrder,
      formatDate,
      prevPage,
      nextPage
    }
  }
}
</script>

<style scoped>
.orders-page {
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

/* Основной контент */
.orders-content {
  padding: 3rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Шапка с статистикой */
.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 2rem;
}

.stats-cards {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat-card {
  padding: 1.5rem;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  text-align: center;
  min-width: 120px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.new-order-btn {
  white-space: nowrap;
}

/* Фильтры */
.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.filter-btn:hover {
  border-color: #1a1a1a;
}

.filter-btn.active {
  background: #1a1a1a;
  color: white;
  border-color: #1a1a1a;
}

.search-box {
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: #1a1a1a;
}

/* Состояния */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top: 3px solid #1a1a1a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 2rem;
}

/* Список заявок */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 2rem;
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 2rem;
}

.order-info {
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
  margin-bottom: 1rem;
}

.order-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #999;
}

.order-status {
  text-align: right;
  flex-shrink: 0;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-in_progress {
  background: #cce7ff;
  color: #004085;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.order-price {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a1a1a;
}

/* Прогресс ремонта */
.repair-progress {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.progress-label {
  font-weight: 500;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.progress-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #1a1a1a;
  transition: width 0.3s ease;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-dot {
  width: 12px;
  height: 12px;
  background: #e0e0e0;
  border-radius: 50%;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.progress-step.active .step-dot {
  background: #1a1a1a;
  transform: scale(1.2);
}

.progress-step.completed .step-dot {
  background: #00a86b;
}

.step-label {
  font-size: 0.8rem;
  color: #666;
  text-align: center;
}

/* Детали заявки */
.order-details {
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  gap: 3rem;
  flex-wrap: wrap;
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

/* Действия */
.order-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Пагинация */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #f0f0f0;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #1a1a1a;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #666;
  font-weight: 500;
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
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #1a1a1a;
}

.modal-form {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #1a1a1a;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #1a1a1a;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

/* Кнопки */
.btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid #1a1a1a;
  background: transparent;
  color: #1a1a1a;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #1a1a1a;
  color: white;
}

.btn-outline {
  background: transparent;
  color: #1a1a1a;
}

.btn-cancel {
  background: transparent;
  color: #dc3545;
  border-color: #dc3545;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Адаптивность */
@media (max-width: 768px) {
  .orders-header {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-cards {
    justify-content: center;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .order-header {
    flex-direction: column;
    gap: 1rem;
  }

  .order-status {
    text-align: left;
  }

  .detail-row {
    flex-direction: column;
    gap: 1rem;
  }

  .order-actions {
    justify-content: stretch;
  }

  .order-actions .btn {
    flex: 1;
    justify-content: center;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }

  .modal-content {
    margin: 1rem;
    width: calc(100% - 2rem);
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>