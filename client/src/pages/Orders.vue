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

          <button @click="showCreateModal = true" class="btn btn-primary new-order-btn">
            <span>+ Новая заявка</span>
          </button>
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
          <button @click="showCreateModal = true" class="btn btn-primary">
            Создать заявку
          </button>
        </div>

        <!-- Список заявок -->
        <div v-else class="orders-list">
          <div v-for="order in filteredOrders" :key="order._id" class="order-card" :class="`status-${order.status}`">
            <div class="order-header">
              <div class="order-info">
                <h3 class="order-title">{{ order.service }}</h3>
                <p class="order-description">{{ order.description }}</p>
                <div class="order-meta">
                  <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                  <span class="order-id">#{{ order._id.slice(-6) }}</span>
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
            <div class="repair-progress" v-if="order.status === 'in_progress' || order.status === 'accepted'">
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
                  <span class="detail-label">Статус:</span>
                  <span class="detail-value">{{ statusLabels[order.status] }}</span>
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
              <button v-if="order.status === 'pending'" @click="editOrder(order)" class="btn btn-outline">
                ✏️ Редактировать
              </button>
              <button v-if="order.status === 'pending'" @click="deleteOrder(order)" class="btn btn-cancel">
                🗑️ Удалить
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

    <!-- Модальное окно создания/редактирования заявки -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingOrder ? 'Редактировать заявку' : 'Новая заявка на ремонт' }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>

        <form @submit.prevent="submitOrder" class="modal-form">
          <div class="form-group">
            <label>Тип устройства *</label>
            <select v-model="form.deviceType" required class="form-input">
              <option value="">Выберите тип устройства</option>
              <option value="Ноутбук">Ноутбук</option>
              <option value="Компьютер">Компьютер</option>
              <option value="Игровая консоль">Игровая консоль</option>
              <option value="Другое">Другое</option>
            </select>
          </div>

          <div class="form-group">
            <label>Модель устройства *</label>
            <input v-model="form.deviceModel" type="text" required placeholder="Например: MacBook Pro 16, iPhone 15 Pro"
              class="form-input">
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
            <button type="button" @click="closeModal" class="btn btn-outline">
              Отмена
            </button>
            <button type="submit" :disabled="creatingOrder" class="btn btn-primary">
              {{ creatingOrder ? 'Сохранение...' : (editingOrder ? 'Сохранить' : 'Создать заявку') }}
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
import { orderService } from '@/services/orderService'

export default {
  name: 'OrdersPage',

  setup() {
    const authStore = useAuthStore()

    const orders = ref([])
    const loading = ref(true)
    const creatingOrder = ref(false)
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const editingOrder = ref(null)
    const currentFilter = ref('all')
    const searchQuery = ref('')
    const currentPage = ref(1)
    const itemsPerPage = ref(5)

    const form = ref({
      deviceType: '',
      deviceModel: '',
      service: '',
      description: ''
    })

    const filters = [
      { key: 'all', label: 'Все заявки' },
      { key: 'pending', label: 'Ожидание' },
      { key: 'accepted', label: 'Принята' },
      { key: 'in_progress', label: 'В работе' },
      { key: 'completed', label: 'Завершённые' },
      { key: 'cancelled', label: 'Отменённые' }
    ]

    const statusLabels = {
      pending: 'Ожидает',
      manager_review: 'На рассмотрении',
      accepted: 'Принята',
      in_progress: 'В работе',
      completed: 'Готово',
      cancelled: 'Отменено',
      rejected: 'Отклонена'
    }

    const progressSteps = [
      { number: 1, label: 'Приём' },
      { number: 2, label: 'Диагностика' },
      { number: 3, label: 'Ремонт' },
      { number: 4, label: 'Тестирование' },
      { number: 5, label: 'Выдача' }
    ]

    // Загрузка заявок с сервера
    const loadOrders = async () => {
      try {
        loading.value = true
        console.log('Загружаем заявки с сервера...')
        const response = await orderService.getMyOrders()
        orders.value = response
        console.log('Заявки загружены:', orders.value.length)
      } catch (error) {
        console.error('Ошибка загрузки заявок:', error)
        alert('Ошибка загрузки заявок: ' + error.message)
      } finally {
        loading.value = false
      }
    }

    // Создание заявки
    const submitOrder = async () => {
      try {
        creatingOrder.value = true

        if (editingOrder.value) {
          // Редактирование заявки
          await orderService.updateOrder(editingOrder.value._id, form.value)
          alert('Заявка успешно обновлена!')
        } else {
          // Создание новой заявки
          await orderService.createOrder(form.value)
          alert('Заявка успешно создана!')
        }

        await loadOrders() // Перезагружаем список
        closeModal()
      } catch (error) {
        console.error('Ошибка сохранения заявки:', error)
        alert('Ошибка: ' + error.message)
      } finally {
        creatingOrder.value = false
      }
    }

    // Удаление заявки
    const deleteOrder = async (order) => {
      if (confirm('Вы уверены, что хотите удалить эту заявку?')) {
        try {
          await orderService.deleteOrder(order._id)
          await loadOrders()
          alert('Заявка удалена')
        } catch (error) {
          console.error('Ошибка удаления заявки:', error)
          alert('Ошибка удаления: ' + error.message)
        }
      }
    }

    // Редактирование заявки
    const editOrder = (order) => {
      editingOrder.value = order
      form.value = {
        deviceType: order.deviceType,
        deviceModel: order.deviceModel,
        service: order.service,
        description: order.description
      }
      showEditModal.value = true
    }

    // Отмена заявки
    const cancelOrder = async (order) => {
      if (confirm('Вы уверены, что хотите отменить эту заявку?')) {
        try {
          await orderService.updateOrder(order._id, { status: 'cancelled' })
          await loadOrders()
          alert('Заявка отменена')
        } catch (error) {
          console.error('Ошибка отмены заявки:', error)
          alert('Ошибка отмены: ' + error.message)
        }
      }
    }

    // Закрытие модального окна
    const closeModal = () => {
      showCreateModal.value = false
      showEditModal.value = false
      editingOrder.value = null
      form.value = {
        deviceType: '',
        deviceModel: '',
        service: '',
        description: ''
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
          (order.description && order.description.toLowerCase().includes(query)) ||
          (order.deviceModel && order.deviceModel.toLowerCase().includes(query))
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
        order.status === 'pending' || order.status === 'accepted' || order.status === 'in_progress'
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

    const viewOrderDetails = (order) => {
      alert(`Детали заявки #${order._id.slice(-6)}\n\nУслуга: ${order.service}\nУстройство: ${order.deviceType} ${order.deviceModel}\nСтатус: ${statusLabels[order.status]}\nОписание: ${order.description}`)
    }

    const downloadReport = (order) => {
      alert(`Отчёт по заявке #${order._id.slice(-6)} скачивается...`)
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
      if (!authStore.isAuthenticated) {
        alert('Вы не авторизованы')
        return
      }
      loadOrders()
    })

    return {
      orders: paginatedOrders,
      loading,
      creatingOrder,
      showCreateModal,
      showEditModal,
      editingOrder,
      currentFilter,
      searchQuery,
      currentPage,
      totalPages,
      filters,
      statusLabels,
      progressSteps,
      form,
      stats,
      filteredOrders: paginatedOrders,
      setFilter,
      submitOrder,
      deleteOrder,
      editOrder,
      cancelOrder,
      closeModal,
      viewOrderDetails,
      downloadReport,
      formatDate,
      prevPage,
      nextPage
    }
  }
}
</script>

<style scoped>
/* Стили остаются без изменений, только добавим кнопки редактирования/удаления */
.order-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-cancel {
  background: transparent;
  color: #dc3545;
  border-color: #dc3545;
}

.btn-cancel:hover {
  background: #dc3545;
  color: white;
}

.edit-order-btn,
.delete-order-btn {
  margin-left: 0.5rem;
}

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