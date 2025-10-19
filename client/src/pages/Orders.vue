<template>
  <div class="panel-page">
    <!-- Hero секция -->
    <section class="page-hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            <i class="pi pi-file"></i>
            Мои заявки
          </h1>
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
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-info">
                <i class="pi pi-file" style="font-size: 2.5rem"></i>
                <div class="stat-number">{{ stats.total }}</div>
              </div>
              <div class="stat-label">Всего заявок</div>
            </div>
            <div class="stat-card">
              <div class="stat-info">
                <i class="pi pi-clock" style="font-size: 2.5rem"></i>
                <div class="stat-number">{{ stats.active }}</div>
              </div>
              <div class="stat-label">Активные</div>
            </div>
            <div class="stat-card">
              <div class="stat-info">
                <i class="pi pi-check-circle" style="font-size: 2.5rem"></i>
                <div class="stat-number">{{ stats.completed }}</div>
              </div>
              <div class="stat-label">Завершённые</div>
            </div>
          </div>

          <div class="header-actions">
            <button @click="showCreateModal = true" class="btn btn-primary">
              <i class="pi pi-plus"></i>
              Новая заявка
            </button>
          </div>
        </div>

        <!-- Фильтры и поиск -->
        <div class="filters-section">
          <div class="filter-buttons">
            <button v-for="filter in filters" :key="filter.key" @click="setFilter(filter.key)"
              :class="['filter-btn', { active: currentFilter === filter.key }]">
              <i :class="filter.icon"></i>
              {{ filter.label }}
            </button>
          </div>

          <div class="search-box">
            <input v-model="searchQuery" type="text" placeholder="Поиск по услуге или описанию..." class="search-input">
            <i class="pi pi-search search-icon"></i>
          </div>
        </div>

        <!-- Состояние загрузки -->
        <div v-if="loading" class="loading-state">
          <div class="spinner">
            <i class="pi pi-spinner pi-spin" style="font-size: 2rem"></i>
          </div>
          <span>Загружаем ваши заявки...</span>
        </div>

        <!-- Состояние пустого списка -->
        <div v-else-if="filteredOrders.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="pi pi-inbox" style="font-size: 4rem"></i>
          </div>
          <h3>Заявок пока нет</h3>
          <p>Создайте первую заявку на ремонт</p>
          <button @click="showCreateModal = true" class="btn btn-primary">
            <i class="pi pi-plus"></i>
            Создать заявку
          </button>
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
                  <div class="order-meta">
                    <span class="order-date">
                      <i class="pi pi-calendar"></i>
                      {{ formatDate(order.createdAt) }}
                    </span>
                    <span class="order-id">
                      <i class="pi pi-hashtag"></i>
                      #{{ order._id.slice(-6) }}
                    </span>
                  </div>
                </div>

                <div class="order-status">
                  <span class="status-badge" :class="`status-${order.status}`">
                    <i :class="getStatusIcon(order.status)"></i>
                    {{ statusLabels[order.status] }}
                  </span>
                  <div class="order-price" v-if="order.price">
                    {{ order.price }} ₽
                  </div>
                </div>
              </div>

              <!-- Прогресс ремонта -->
              <div class="repair-progress" v-if="order.status === 'in_progress' || order.status === 'accepted'">
                <div class="progress-header">
                  <span class="progress-label">Прогресс ремонта:</span>
                  <span class="progress-percent">{{ Math.round((order.progress / 5) * 100) }}%</span>
                </div>
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
                    <span class="detail-label">
                      <i class="pi pi-desktop"></i>
                      Устройство:
                    </span>
                    <span class="detail-value">{{ order.deviceType }} {{ order.deviceModel }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">
                      <i class="pi pi-info-circle"></i>
                      Статус:
                    </span>
                    <span class="detail-value">{{ statusLabels[order.status] }}</span>
                  </div>
                </div>
                <div class="detail-row" v-if="order.assignedMaster">
                  <div class="detail-item">
                    <span class="detail-label">
                      <i class="pi pi-user"></i>
                      Мастер:
                    </span>
                    <span class="detail-value">Мастер #{{ order.assignedMaster.slice(-6) }}</span>
                  </div>
                </div>
              </div>

              <!-- Действия -->
              <div class="order-actions">
                <button @click="viewOrderDetails(order)" class="btn btn-outline">
                  <i class="pi pi-eye"></i>
                  Подробнее
                </button>
                <button v-if="order.status === 'completed'" @click="downloadReport(order)" class="btn btn-outline">
                  <i class="pi pi-download"></i>
                  Скачать отчёт
                </button>
                <button v-if="order.status === 'pending'" @click="cancelOrder(order)" class="btn btn-danger">
                  <i class="pi pi-times"></i>
                  Отменить
                </button>
                <button v-if="order.status === 'pending'" @click="editOrder(order)" class="btn btn-outline">
                  <i class="pi pi-pencil"></i>
                  Редактировать
                </button>
                <button v-if="order.status === 'pending'" @click="deleteOrder(order)" class="btn btn-danger">
                  <i class="pi pi-trash"></i>
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Пагинация -->
        <div v-if="filteredOrders.length > 0" class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn">
            <i class="pi pi-chevron-left"></i>
            Назад
          </button>

          <span class="pagination-info">
            Страница {{ currentPage }} из {{ totalPages }}
          </span>

          <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">
            Вперед
            <i class="pi pi-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>

    <!-- Модальное окно создания/редактирования заявки -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="pi" :class="editingOrder ? 'pi-pencil' : 'pi-plus'"></i>
            {{ editingOrder ? 'Редактировать заявку' : 'Новая заявка на ремонт' }}
          </h3>
          <button @click="closeModal" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="submitOrder" class="modal-form">
          <div class="form-grid">
            <div class="form-group">
              <label>
                <i class="pi pi-mobile"></i>
                Тип устройства *
              </label>
              <select v-model="form.deviceType" required class="form-input">
                <option value="">Выберите тип устройства</option>
                <option value="Ноутбук">Ноутбук</option>
                <option value="Компьютер">Компьютер</option>
                <option value="Смартфон">Смартфон</option>
                <option value="Планшет">Планшет</option>
                <option value="Игровая консоль">Игровая консоль</option>
                <option value="Другое">Другое</option>
              </select>
            </div>

            <div class="form-group">
              <label>
                <i class="pi pi-tag"></i>
                Модель устройства *
              </label>
              <input v-model="form.deviceModel" type="text" required placeholder="Например: MacBook Pro 16, iPhone 15 Pro"
                class="form-input">
            </div>

            <div class="form-group">
              <label>
                <i class="pi pi-wrench"></i>
                Услуга *
              </label>
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

            <div class="form-group full-width">
              <label>
                <i class="pi pi-file-edit"></i>
                Описание проблемы *
              </label>
              <textarea v-model="form.description" required placeholder="Подробно опишите проблему с устройством..."
                rows="4" class="form-input"></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn btn-outline">
              <i class="pi pi-times"></i>
              Отмена
            </button>
            <button type="submit" :disabled="creatingOrder" class="btn btn-primary">
              <i class="pi" :class="creatingOrder ? 'pi-spinner pi-spin' : (editingOrder ? 'pi-check' : 'pi-plus')"></i>
              {{ creatingOrder ? 'Сохранение...' : (editingOrder ? 'Сохранить изменения' : 'Создать заявку') }}
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
    const itemsPerPage = ref(6)

    const form = ref({
      deviceType: '',
      deviceModel: '',
      service: '',
      description: ''
    })

    const filters = [
      { key: 'all', label: 'Все заявки', icon: 'pi pi-list' },
      { key: 'pending', label: 'Ожидание', icon: 'pi pi-clock' },
      { key: 'accepted', label: 'Принята', icon: 'pi pi-check' },
      { key: 'in_progress', label: 'В работе', icon: 'pi pi-cog' },
      { key: 'completed', label: 'Завершённые', icon: 'pi pi-check-circle' },
      { key: 'cancelled', label: 'Отменённые', icon: 'pi pi-times-circle' }
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
      const details = `
Детали заявки #${order._id.slice(-6)}

Услуга: ${order.service}
Устройство: ${order.deviceType} ${order.deviceModel}
Статус: ${statusLabels[order.status]}
${order.price ? `Цена: ${order.price} ₽` : 'Цена: рассчитывается'}
${order.progress ? `Прогресс: ${order.progress}/5` : ''}

Описание проблемы:
${order.description}

Дата создания: ${formatDate(order.createdAt)}
      `.trim()

      alert(details)
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
      nextPage,
      getStatusIcon
    }
  }
}
</script>

<style scoped>
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

/* Основной контент */
.orders-content {
  padding: 3rem 0;
}

/* Шапка с статистикой */
.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  flex: 1;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem;
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
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-info {
  display: flex;
  align-items: center;
  gap: 1rem;
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

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Фильтры и поиск */
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

.search-box {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e1e1e1;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #333;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
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
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.order-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: #666;
}

.order-date,
.order-id {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.order-status {
  text-align: right;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
  min-width: 150px;
}

.status-badge {
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

.status-accepted {
  background: #d4edda;
  color: #155724;
  --status-color: #28a745;
}

.status-in_progress {
  background: #cce7ff;
  color: #004085;
  --status-color: #007bff;
}

.status-completed {
  background: #e8f5e8;
  color: #2e7d32;
  --status-color: #059669;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
  --status-color: #dc3545;
}

.order-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #059669;
}

/* Прогресс ремонта */
.repair-progress {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #333;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-label {
  font-weight: 600;
  color: #1a1a1a;
}

.progress-percent {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #333;
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
  flex: 1;
}

.step-dot {
  width: 16px;
  height: 16px;
  background: #e0e0e0;
  border-radius: 50%;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
  border: 2px solid white;
}

.progress-step.active .step-dot {
  background: #333;
  transform: scale(1.2);
}

.progress-step.completed .step-dot {
  background: #059669;
  border-color: #059669;
}

.step-label {
  font-size: 0.8rem;
  color: #666;
  text-align: center;
  font-weight: 500;
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
  margin-bottom: 1rem;
}

.detail-row:last-child {
  margin-bottom: 0;
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

/* Действия */
.order-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
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

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
  border-color: #5a6fd8;
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.btn-outline {
  background: transparent;
  border-color: #333;
  color: #333;
}

.btn-outline:hover {
  background: #333;
  color: white;
  transform: translateY(-1px);
}

.btn-danger {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
  border-color: #dc2626;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
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
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #333;
  color: #333;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.pagination-info {
  color: #666;
  font-weight: 500;
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
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0 0 2rem 0;
  font-size: 1rem;
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
  font-size: 1.5rem;
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

.modal-form {
  padding: 1rem 2rem 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #333;
}

.form-input::placeholder {
  color: #999;
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f0f0f0;
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

  .orders-header {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: 1fr;
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
    align-items: flex-start;
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

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .progress-steps {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .progress-step {
    flex: none;
    width: calc(50% - 0.5rem);
  }
}

/* Анимации */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
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