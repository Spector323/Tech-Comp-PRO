<template>
    <div class="panel-page">
      <!-- Hero секция -->
      <section class="page-hero">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Мастерская</h1>
            <p class="hero-subtitle">
              Ремонт устройств и управление рабочими заявками
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
                <div class="stat-number">{{ stats.assigned }}</div>
                <div class="stat-label">Назначенные</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⚡</div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.inProgress }}</div>
                <div class="stat-label">В работе</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.completed }}</div>
                <div class="stat-label">Завершённые</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.earnings }} ₽</div>
                <div class="stat-label">Заработок</div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Доступные заявки -->
      <section class="orders-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Доступные заявки</h2>
            <p class="section-subtitle">Заявки, принятые менеджером и готовые к работе</p>
            <div class="section-actions">
              <button @click="loadOrders" class="btn btn-outline" :disabled="loading">
                🔄 Обновить
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
            <div 
              v-for="order in availableOrders" 
              :key="order._id"
              class="order-card-master"
              :class="`status-${order.status}`"
            >
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
                      <span class="client-contact">{{ order.user?.phone || 'Телефон не указан' }}</span>
                      <span class="client-email">{{ order.user?.email }}</span>
                    </div>
                  </div>
                </div>
  
                <div class="order-meta">
                  <div class="order-status-badge" :class="`status-${order.status}`">
                    {{ statusLabels[order.status] }}
                  </div>
                  <div class="order-date">{{ formatDate(order.createdAt) }}</div>
                  <div class="order-id">#{{ order._id.slice(-6) }}</div>
                  <div class="manager-info" v-if="order.assignedManager">
                    <span class="manager-label">Менеджер:</span>
                    <span class="manager-name">ID{{ order.assignedManager.slice(-6) }}</span>
                  </div>
                </div>
              </div>
  
              <div class="order-details">
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">Устройство:</span>
                    <span class="detail-value">{{ order.deviceType }} {{ order.deviceModel }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Принята менеджером:</span>
                    <span class="detail-value">{{ formatDateTime(order.updatedAt) }}</span>
                  </div>
                </div>
              </div>
  
              <!-- Действия мастера -->
              <div class="master-actions">
                <button 
                  @click="takeOrder(order)" 
                  class="btn btn-primary"
                  :disabled="order.assignedMaster === authStore.user?.id"
                >
                  🛠️ {{ order.assignedMaster === authStore.user?.id ? 'В работе' : 'Взять в работу' }}
                </button>
  
                <button 
                  v-if="order.assignedMaster === authStore.user?.id" 
                  @click="openPriceModal(order)" 
                  class="btn btn-success"
                >
                  💰 Установить цену
                </button>
  
                <button 
                  v-if="order.assignedMaster === authStore.user?.id && order.price" 
                  @click="completeOrder(order)" 
                  class="btn btn-complete"
                >
                  ✅ Завершить ремонт
                </button>
  
                <button @click="viewOrderDetails(order)" class="btn btn-outline">
                  👁️ Подробнее
                </button>
              </div>
  
              <!-- Информация о цене -->
              <div v-if="order.price" class="price-section">
                <div class="price-display">
                  <span class="price-label">Установленная цена:</span>
                  <span class="price-value">{{ order.price }} ₽</span>
                </div>
                <div class="price-actions" v-if="order.assignedMaster === authStore.user?.id">
                  <button @click="openPriceModal(order)" class="btn-link">
                    Изменить цену
                  </button>
                </div>
              </div>
  
              <!-- Прогресс работы -->
              <div v-if="order.assignedMaster === authStore.user?.id" class="progress-section">
                <div class="progress-label">Прогресс ремонта:</div>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: `${(order.progress / 8) * 100}%` }"
                  ></div>
                </div>
                <div class="progress-steps">
                  <div 
                    v-for="step in progressSteps" 
                    :key="step.number"
                    class="progress-step"
                    :class="{ 
                      active: order.progress >= step.number,
                      completed: order.progress > step.number
                    }"
                  >
                    <div class="step-dot"></div>
                    <span class="step-label">{{ step.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Пустое состояние -->
          <div v-if="!loading && availableOrders.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>Нет доступных заявок</h3>
            <p>Все заявки уже взяты в работу или ожидают принятия менеджером</p>
          </div>
        </div>
      </section>
  
      <!-- Мои заявки в работе -->
      <section class="my-orders-section" v-if="myOrders.length > 0">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Мои заявки в работе</h2>
            <p class="section-subtitle">Заявки, которые вы взяли в работу</p>
          </div>
  
          <div class="orders-grid">
            <div 
              v-for="order in myOrders" 
              :key="order._id"
              class="order-card-master my-order"
            >
              <div class="order-badge">МОЯ РАБОТА</div>
              <div class="order-header">
                <div class="order-main">
                  <h3 class="order-title">{{ order.service }}</h3>
                  <p class="order-description">{{ order.description }}</p>
                  
                  <div class="urgency-indicator" v-if="order.createdAt < new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()">
                    ⚠️ Срочный заказ
                  </div>
                </div>
  
                <div class="order-meta">
                  <div class="order-status-badge status-in_progress">
                    В работе
                  </div>
                  <div class="order-date">{{ formatDate(order.createdAt) }}</div>
                  <div class="order-price-large" v-if="order.price">
                    {{ order.price }} ₽
                  </div>
                </div>
              </div>
  
              <div class="master-actions">
                <button 
                  @click="openPriceModal(order)" 
                  class="btn btn-success"
                >
                  💰 {{ order.price ? 'Изменить цену' : 'Установить цену' }}
                </button>
  
                <button 
                  v-if="order.price" 
                  @click="updateProgress(order, order.progress + 1)"
                  class="btn btn-primary"
                  :disabled="order.progress >= 5"
                >
                  📈 Следующий этап
                </button>
  
                <button 
                  v-if="order.price && order.progress >= 3" 
                  @click="completeOrder(order)" 
                  class="btn btn-complete"
                >
                  ✅ Завершить
                </button>
  
                <button 
                  @click="releaseOrder(order)" 
                  class="btn btn-danger"
                >
                  🚫 Вернуть в пул
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Модальное окно установки цены -->
      <div v-if="priceModalOrder" class="modal-overlay" @click="priceModalOrder = null">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Установить цену для заявки #{{ priceModalOrder._id.slice(-6) }}</h3>
            <button @click="priceModalOrder = null" class="close-btn">×</button>
          </div>
          
          <div class="modal-body">
            <div class="order-preview">
              <h4>{{ priceModalOrder.service }}</h4>
              <p>{{ priceModalOrder.deviceType }} {{ priceModalOrder.deviceModel }}</p>
              <p class="description">{{ priceModalOrder.description }}</p>
            </div>
  
            <div class="price-form">
              <div class="form-group">
                <label>Стоимость ремонта (₽) *</label>
                <input 
                  v-model="priceValue" 
                  type="number" 
                  min="0" 
                  class="form-input"
                  placeholder="Введите стоимость"
                  required
                >
              </div>
  
              <div class="price-suggestions">
                <div class="suggestion-label">Рекомендуемые цены:</div>
                <div class="suggestion-buttons">
                  <button 
                    v-for="suggestion in priceSuggestions" 
                    :key="suggestion"
                    @click="priceValue = suggestion"
                    class="btn-suggestion"
                  >
                    {{ suggestion }} ₽
                  </button>
                </div>
              </div>
  
              <div class="price-preview">
                <div class="preview-item">
                  <span>Стоимость работ:</span>
                  <span>{{ priceValue || 0 }} ₽</span>
                </div>
                <div class="preview-total">
                  <span>Итоговая цена для клиента:</span>
                  <span class="total-price">{{ priceValue || 0 }} ₽</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="priceModalOrder = null" class="btn btn-outline">
              Отмена
            </button>
            <button @click="setPrice" class="btn btn-primary" :disabled="!priceValue">
              Установить цену
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
    name: 'MasterPanel',
  
    setup() {
      const authStore = useAuthStore()
      const orders = ref([])
      const loading = ref(false)
      const priceModalOrder = ref(null)
      const priceValue = ref('')
  
      const statusLabels = {
        accepted: 'Принята менеджером',
        in_progress: 'В работе',
        completed: 'Завершена'
      }
  
      const progressSteps = [
        { number: 1, label: 'Диагностика' },
        { number: 2, label: 'Заказ запчастей' },
        { number: 3, label: 'Ремонт' },
        { number: 4, label: 'Тестирование' },
        { number: 5, label: 'Готово' }
      ]
  
      const priceSuggestions = [1500, 3000, 5000, 7500, 10000, 15000]
  
      // Загрузка заявок с реальными данными
      const loadOrders = async () => {
        try {
          loading.value = true
          const response = await orderService.getMyOrders()
          orders.value = response
          console.log('Загружены заявки:', orders.value)
        } catch (error) {
          console.error('Ошибка загрузки заявок:', error)
          alert('Ошибка загрузки заявок: ' + error.message)
        } finally {
          loading.value = false
        }
      }
  
      // Доступные заявки (принятые менеджером)
      const availableOrders = computed(() => {
        return orders.value.filter(order => 
          order.status === 'accepted' || 
          (order.status === 'in_progress' && !order.assignedMaster)
        )
      })
  
      // Мои заявки в работе
      const myOrders = computed(() => {
        return orders.value.filter(order => 
          order.assignedMaster === authStore.user?.id && 
          order.status === 'in_progress'
        )
      })
  
      // Взять заявку в работу
      const takeOrder = async (order) => {
        try {
          await orderService.assignToMaster(order._id)
          await loadOrders()
          alert('Заявка взята в работу!')
        } catch (error) {
          alert('Ошибка: ' + error.message)
        }
      }
  
      // Вернуть заявку в пул
      const releaseOrder = async (order) => {
        if (confirm('Вернуть эту заявку в доступные для других мастеров?')) {
          try {
            await orderService.updateOrder(order._id, {
              assignedMaster: null,
              status: 'accepted'
            })
            await loadOrders()
            alert('Заявка возвращена в пул')
          } catch (error) {
            alert('Ошибка: ' + error.message)
          }
        }
      }
  
      // Установить цену
      const openPriceModal = (order) => {
        priceModalOrder.value = order
        priceValue.value = order.price || ''
      }
  
      const setPrice = async () => {
        if (!priceValue.value) {
          alert('Введите стоимость ремонта')
          return
        }
  
        try {
          await orderService.setPrice(priceModalOrder.value._id, parseInt(priceValue.value))
          
          // Если заявка еще не в работе, переводим ее в работу
          if (priceModalOrder.value.status === 'accepted') {
            await orderService.assignToMaster(priceModalOrder.value._id)
          }
          
          await loadOrders()
          priceModalOrder.value = null
          priceValue.value = ''
          alert('Цена установлена и заявка переведена в работу!')
        } catch (error) {
          alert('Ошибка: ' + error.message)
        }
      }
  
      // Обновить прогресс
      const updateProgress = async (order, newProgress) => {
        try {
          await orderService.updateOrder(order._id, { 
            progress: Math.min(newProgress, 5)
          })
          await loadOrders()
          
          if (newProgress >= 5) {
            alert('Ремонт завершен!')
          } else {
            alert('Прогресс обновлен')
          }
        } catch (error) {
          alert('Ошибка: ' + error.message)
        }
      }
  
      // Завершить заявку
      const completeOrder = async (order) => {
        if (confirm('Завершить ремонт и уведомить клиента?')) {
          try {
            await orderService.updateOrder(order._id, { 
              status: 'completed', 
              progress: 5 
            })
            await loadOrders()
            alert('Заявка завершена! Клиент будет уведомлен.')
          } catch (error) {
            alert('Ошибка: ' + error.message)
          }
        }
      }
  
      const viewOrderDetails = (order) => {
        const details = `
  Детали заявки #${order._id.slice(-6)}
  
  Клиент: ${order.user?.firstName} ${order.user?.lastName}
  Телефон: ${order.user?.phone || 'не указан'}
  Email: ${order.user?.email}
  
  Устройство: ${order.deviceType} ${order.deviceModel}
  Услуга: ${order.service}
  Проблема: ${order.description}
  
  Статус: ${statusLabels[order.status]}
  Прогресс: ${order.progress}/5
  ${order.price ? `Цена: ${order.price} ₽` : 'Цена еще не установлена'}
  
  Дата создания: ${formatDateTime(order.createdAt)}
        `.trim()
  
        alert(details)
      }
  
      // Статистика с реальными данными
      const stats = computed(() => {
        const assigned = myOrders.value.length
        const inProgress = myOrders.value.length
        const completed = orders.value.filter(o => 
          o.assignedMaster === authStore.user?.id && 
          o.status === 'completed'
        ).length
        
        const earnings = orders.value
          .filter(o => o.assignedMaster === authStore.user?.id && o.price)
          .reduce((sum, order) => sum + order.price, 0)
  
        return {
          assigned,
          inProgress,
          completed,
          earnings
        }
      })
  
      const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU')
      }
  
      const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('ru-RU')
      }
  
      onMounted(() => {
        if (authStore.userRole !== 'master' && authStore.userRole !== 'admin') {
          alert('Доступ запрещен')
          return
        }
        loadOrders()
      })
  
      return {
        authStore,
        orders,
        loading,
        priceModalOrder,
        priceValue,
        statusLabels,
        progressSteps,
        priceSuggestions,
        availableOrders,
        myOrders,
        stats,
        loadOrders,
        takeOrder,
        releaseOrder,
        openPriceModal,
        setPrice,
        updateProgress,
        completeOrder,
        viewOrderDetails,
        formatDate,
        formatDateTime
      }
    }
  }
  </script>
  
  <style scoped>
  /* Основные стили из предыдущего кода остаются */
  
  .panel-page {
    background: #f8f9fa;
    min-height: 100vh;
  }
  
  .page-hero {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    color: white;
    padding: 4rem 0 3rem;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
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
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
  
  .stat-icon {
    font-size: 3rem;
    margin-right: 1.5rem;
  }
  
  .stat-info {
    flex: 1;
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
  
  /* Секции */
  .orders-section, .my-orders-section {
    padding: 3rem 0;
  }
  
  .section-header {
    margin-bottom: 2rem;
  }
  
  .section-title {
    font-size: 2rem;
    font-weight: 300;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
  }
  
  .section-subtitle {
    color: #666;
    margin-bottom: 1rem;
  }
  
  .section-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  
  /* Карточки заявок */
  .orders-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .order-card-master {
    background: white;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
    position: relative;
  }
  
  .order-card-master:hover {
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }
  
  .order-card-master.my-order {
    border-left: 4px solid #1a1a1a;
  }
  
  .order-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: #1a1a1a;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
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
  
  .client-contact, .client-email {
    font-size: 0.9rem;
    color: #666;
  }
  
  .order-meta {
    text-align: right;
    flex-shrink: 0;
    min-width: 150px;
  }
  
  .order-status-badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
  
  .status-accepted {
    background: #d4edda;
    color: #155724;
  }
  
  .status-in_progress {
    background: #cce7ff;
    color: #004085;
  }
  
  .status-completed {
    background: #e8f5e8;
    color: #2e7d32;
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
  
  .manager-info {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #f0f0f0;
  }
  
  .manager-label {
    font-size: 0.8rem;
    color: #666;
  }
  
  .manager-name {
    font-size: 0.8rem;
    color: #1a1a1a;
    font-weight: 500;
  }
  
  /* Детали заявки */
  .order-details {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
  }
  
  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
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
  
  /* Действия мастера */
  .master-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }
  
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
  
  .btn-primary:hover {
    background: #333;
  }
  
  .btn-success {
    background: #28a745;
    color: white;
    border: none;
  }
  
  .btn-success:hover {
    background: #218838;
  }
  
  .btn-complete {
    background: #28a745;
    color: white;
    border: none;
  }
  
  .btn-complete:hover {
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
  
  .btn-outline {
    background: transparent;
    color: #1a1a1a;
  }
  
  .btn-outline:hover {
    background: #f8f9fa;
  }
  
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* Секция цены */
  .price-section {
    padding: 1rem;
    background: #e8f5e8;
    border-radius: 8px;
    border: 1px solid #d4edda;
    margin-bottom: 1rem;
  }
  
  .price-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .price-label {
    font-weight: 500;
    color: #155724;
  }
  
  .price-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #155724;
  }
  
  .price-actions {
    text-align: right;
  }
  
  .btn-link {
    background: none;
    border: none;
    color: #1a1a1a;
    cursor: pointer;
    text-decoration: underline;
    font-size: 0.9rem;
  }
  
  .btn-link:hover {
    color: #333;
  }
  
  /* Прогресс */
  .progress-section {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
  }
  
  .progress-label {
    font-weight: 500;
    margin-bottom: 0.75rem;
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
    flex: 1;
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
    background: #28a745;
  }
  
  .step-label {
    font-size: 0.8rem;
    color: #666;
    text-align: center;
  }
  
  /* Индикатор срочности */
  .urgency-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #fff3cd;
    color: #856404;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    margin-top: 0.5rem;
  }
  
  /* Цена в мета-информации */
  .order-price-large {
    font-size: 1.5rem;
    font-weight: 600;
    color: #28a745;
    margin-top: 0.5rem;
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
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
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
    font-size: 1.5rem;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.3s ease;
  }
  
  .close-btn:hover {
    background: #f5f5f5;
    color: #1a1a1a;
  }
  
  .modal-body {
    padding: 2rem;
  }
  
  .order-preview {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
  }
  
  .order-preview h4 {
    margin: 0 0 0.5rem 0;
    color: #1a1a1a;
  }
  
  .order-preview .description {
    color: #666;
    font-style: italic;
    margin: 0;
  }
  
  .price-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-group label {
    font-weight: 500;
    color: #1a1a1a;
  }
  
  .form-input {
    padding: 0.75rem 1rem;
    border: 2px solid #e1e1e1;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
  }
  
  .form-input:focus {
    outline: none;
    border-color: #1a1a1a;
  }
  
  .price-suggestions {
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
  }
  
  .suggestion-label {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.75rem;
  }
  
  .suggestion-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .btn-suggestion {
    padding: 0.5rem 1rem;
    background: white;
    border: 1px solid #e1e1e1;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
  }
  
  .btn-suggestion:hover {
    border-color: #1a1a1a;
    background: #f8f9fa;
  }
  
  .price-preview {
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
  }
  
  .preview-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    color: #666;
  }
  
  .preview-total {
    display: flex;
    justify-content: space-between;
    padding-top: 0.5rem;
    border-top: 1px solid #e1e1e1;
    font-weight: 600;
    color: #1a1a1a;
  }
  
  .total-price {
    font-size: 1.2rem;
    color: #28a745;
  }
  
  .modal-footer {
    padding: 1rem 2rem 2rem;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    border-top: 1px solid #f0f0f0;
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
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f0f0f0;
    border-top: 3px solid #1a1a1a;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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
  
  /* Адаптивность */
  @media (max-width: 768px) {
    .container {
      padding: 0 1rem;
    }
    
    .order-header {
      flex-direction: column;
      gap: 1rem;
    }
    
    .order-meta {
      text-align: left;
    }
    
    .detail-grid {
      grid-template-columns: 1fr;
    }
    
    .master-actions {
      flex-direction: column;
    }
    
    .price-display {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }
    
    .progress-steps {
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .progress-step {
      flex: none;
      width: calc(50% - 0.5rem);
    }
    
    .modal-content {
      margin: 1rem;
      width: calc(100% - 2rem);
    }
    
    .modal-footer {
      flex-direction: column;
    }
  }
  </style>