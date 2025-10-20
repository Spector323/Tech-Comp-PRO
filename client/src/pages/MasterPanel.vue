<template>
    <div class="panel-page">
        <!-- Hero секция -->
        <section class="page-hero">
            <div class="container">
                <div class="hero-content">
                    <h1 class="hero-title">
                        <i class="pi pi-wrench"></i>
                        Мастерская
                    </h1>
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
                        <div class="stat-info">
                            <i class="pi pi-inbox" style="font-size: 2.5rem"></i>
                            <div class="stat-number">{{ stats.assigned }}</div>
                        </div>
                        <div class="stat-label">Назначенные</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <i class="pi pi-cog" style="font-size: 2.5rem"></i>
                            <div class="stat-number">{{ stats.inProgress }}</div>
                        </div>
                        <div class="stat-label">В работе</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <i class="pi pi-check-circle" style="font-size: 2.5rem"></i>
                            <div class="stat-number">{{ stats.completed }}</div>
                        </div>
                        <div class="stat-label">Завершённые</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <i class="pi pi-money-bill" style="font-size: 2.5rem"></i>
                            <div class="stat-number">{{ stats.earnings }} ₽</div>
                        </div>
                        <div class="stat-label">Заработок</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Доступные заявки -->
        <section class="orders-section">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="pi pi-list"></i>
                        Доступные заявки
                    </h2>
                    <div class="section-actions">
                        <button @click="loadOrders" class="btn btn-outline" :disabled="loading">
                            <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
                            Обновить
                        </button>
                        <input v-model="searchQuery" type="text" placeholder="Поиск заявок..." class="search-input" />
                    </div>
                </div>

                <div class="section-subtitle">
                    Заявки, принятые менеджером и готовые к работе
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
                        <div v-for="order in filteredAvailableOrders" :key="order._id" class="order-card"
                            :class="`status-${order.status}`">
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
                                                <i class="pi pi-phone"></i>
                                                {{ order.user?.phone || 'Телефон не указан' }}
                                            </span>
                                            <span class="client-email">
                                                <i class="pi pi-envelope"></i>
                                                {{ order.user?.email }}
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
                                    <div class="manager-info" v-if="order.assignedManager">
                                        <span class="info-label">
                                            <i class="pi pi-user"></i>
                                            Менеджер:
                                        </span>
                                        <span class="info-value">ID{{ order.assignedManager.slice(-6) }}</span>
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
                                            Принята менеджером:
                                        </span>
                                        <span class="detail-value">{{ formatDateTime(order.updatedAt) }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Действия мастера -->
                            <div class="master-actions">
                                <button @click="takeOrder(order)" class="btn btn-primary"
                                    :disabled="order.assignedMaster === authStore.user?.id">
                                    <i class="pi pi-wrench"></i>
                                    {{ order.assignedMaster === authStore.user?.id ? 'В работе' : 'Взять в работу' }}
                                </button>

                                <button v-if="order.assignedMaster === authStore.user?.id" @click="openPriceModal(order)"
                                    class="btn btn-success">
                                    <i class="pi pi-money-bill"></i>
                                    Установить цену
                                </button>

                                <button v-if="order.assignedMaster === authStore.user?.id && order.price"
                                    @click="completeOrder(order)" class="btn btn-complete">
                                    <i class="pi pi-check"></i>
                                    Завершить ремонт
                                </button>

                                <button @click="viewOrderDetails(order)" class="btn btn-outline">
                                    <i class="pi pi-eye"></i>
                                    Подробнее
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
                                    <div class="progress-fill" :style="{ width: `${(order.progress / 5) * 100}%` }"></div>
                                </div>
                                <div class="progress-steps">
                                    <div v-for="step in progressSteps" :key="step.number" class="progress-step"
                                        :class="{
                                            active: order.progress >= step.number,
                                            completed: order.progress > step.number
                                        }">
                                        <div class="step-dot"></div>
                                        <span class="step-label">{{ step.label }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Пустое состояние -->
                <div v-if="!loading && filteredAvailableOrders.length === 0" class="empty-state">
                    <div class="empty-icon">
                        <i class="pi pi-inbox" style="font-size: 4rem"></i>
                    </div>
                    <h3>Нет доступных заявок</h3>
                    <p>Все заявки уже взяты в работу или ожидают принятия менеджером</p>
                </div>
            </div>
        </section>

        <!-- Мои заявки в работе -->
        <section class="my-orders-section" v-if="myOrders.length > 0">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="pi pi-briefcase"></i>
                        Мои заявки в работе
                    </h2>
                    <p class="section-subtitle">Заявки, которые вы взяли в работу</p>
                </div>

                <div class="orders-container">
                    <div class="orders-grid">
                        <div v-for="order in myOrders" :key="order._id" class="order-card my-order">
                            <div class="order-badge">
                                <i class="pi pi-star"></i>
                                МОЯ РАБОТА
                            </div>
                            <div class="order-header">
                                <div class="order-main">
                                    <h3 class="order-title">
                                        <i class="pi pi-tag"></i>
                                        {{ order.service }}
                                    </h3>
                                    <p class="order-description">{{ order.description }}</p>

                                    <div class="urgency-indicator"
                                        v-if="isUrgentOrder(order)">
                                        <i class="pi pi-exclamation-triangle"></i>
                                        Срочный заказ
                                    </div>
                                </div>

                                <div class="order-meta">
                                    <div class="order-status-badge status-in_progress">
                                        <i class="pi pi-cog"></i>
                                        В работе
                                    </div>
                                    <div class="order-date">
                                        <i class="pi pi-calendar"></i>
                                        {{ formatDate(order.createdAt) }}
                                    </div>
                                    <div class="order-price-large" v-if="order.price">
                                        {{ order.price }} ₽
                                    </div>
                                </div>
                            </div>

                            <div class="master-actions">
                                <button @click="openPriceModal(order)" class="btn btn-success">
                                    <i class="pi pi-money-bill"></i>
                                    {{ order.price ? 'Изменить цену' : 'Установить цену' }}
                                </button>

                                <button v-if="order.price" @click="updateProgress(order, order.progress + 1)"
                                    class="btn btn-primary" :disabled="order.progress >= 5">
                                    <i class="pi pi-arrow-right"></i>
                                    Следующий этап
                                </button>

                                <button v-if="order.price && order.progress >= 3" @click="completeOrder(order)"
                                    class="btn btn-complete">
                                    <i class="pi pi-check"></i>
                                    Завершить
                                </button>

                                <button @click="releaseOrder(order)" class="btn btn-danger">
                                    <i class="pi pi-times"></i>
                                    Вернуть в пул
                                </button>
                            </div>

                            <!-- Прогресс для моих заявок -->
                            <div class="progress-section">
                                <div class="progress-header">
                                    <span class="progress-label">Прогресс ремонта:</span>
                                    <span class="progress-percent">{{ Math.round((order.progress / 5) * 100) }}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" :style="{ width: `${(order.progress / 5) * 100}%` }"></div>
                                </div>
                                <div class="progress-steps">
                                    <div v-for="step in progressSteps" :key="step.number" class="progress-step"
                                        :class="{
                                            active: order.progress >= step.number,
                                            completed: order.progress > step.number
                                        }">
                                        <div class="step-dot"></div>
                                        <span class="step-label">{{ step.label }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Модальное окно установки цены -->
        <div v-if="priceModalOrder" class="modal-overlay" @click="priceModalOrder = null">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>
                        <i class="pi pi-money-bill"></i>
                        Установить цену для заявки #{{ priceModalOrder._id.slice(-6) }}
                    </h3>
                    <button @click="priceModalOrder = null" class="close-btn">
                        <i class="pi pi-times"></i>
                    </button>
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
                            <input v-model="priceValue" type="number" min="0" class="form-input"
                                placeholder="Введите стоимость" required>
                        </div>

                        <div class="price-suggestions">
                            <div class="suggestion-label">Рекомендуемые цены:</div>
                            <div class="suggestion-buttons">
                                <button v-for="suggestion in priceSuggestions" :key="suggestion"
                                    @click="priceValue = suggestion" class="btn-suggestion">
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
                        <i class="pi pi-times"></i>
                        Отмена
                    </button>
                    <button @click="setPrice" class="btn btn-primary" :disabled="!priceValue">
                        <i class="pi pi-check"></i>
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
        const searchQuery = ref('')

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

        const getStatusIcon = (status) => {
            const icons = {
                accepted: 'pi pi-check',
                in_progress: 'pi pi-cog',
                completed: 'pi pi-check-circle'
            }
            return icons[status] || 'pi pi-question-circle'
        }

        const isUrgentOrder = (order) => {
            const orderDate = new Date(order.createdAt)
            const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            return orderDate < twoDaysAgo
        }

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

        // Фильтрация доступных заявок
        const filteredAvailableOrders = computed(() => {
            let filtered = availableOrders.value

            if (searchQuery.value) {
                const query = searchQuery.value.toLowerCase()
                filtered = filtered.filter(order =>
                    order.service.toLowerCase().includes(query) ||
                    order.description.toLowerCase().includes(query) ||
                    order.deviceType.toLowerCase().includes(query) ||
                    order.deviceModel.toLowerCase().includes(query) ||
                    (order.user?.firstName?.toLowerCase().includes(query)) ||
                    (order.user?.lastName?.toLowerCase().includes(query))
                )
            }

            return filtered
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
            searchQuery,
            statusLabels,
            progressSteps,
            priceSuggestions,
            availableOrders,
            filteredAvailableOrders,
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
            formatDateTime,
            getStatusIcon,
            isUrgentOrder
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

/* Секции */
.orders-section,
.my-orders-section {
    padding: 3rem 0;
    background: white;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
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

.section-subtitle {
    color: #666;
    font-size: 1rem;
    margin-bottom: 2rem;
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

.order-card.my-order {
    border-left: 4px solid #333;
    background: #f0fdf4;
}

.order-card.my-order::before {
    background: #333;
}

.order-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: #333;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

.client-contact,
.client-email {
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
    min-width: 180px;
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
    --status-color: #333;
}

.order-date,
.order-id {
    font-size: 0.9rem;
    color: #666;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.manager-info {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #f0f0f0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.info-label {
    font-size: 0.8rem;
    color: #666;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.info-value {
    font-size: 0.9rem;
    color: #1a1a1a;
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

/* Действия мастера */
.master-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
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
    background: #666;
    border-color: #666;
}

.btn-success {
    background: #10b981;
    border-color: #10b981;
    color: white;
}

.btn-success:hover {
    background: #333;
    border-color: #333;
}

.btn-complete {
    background: #333;
    border-color: #333;
    color: white;
}

.btn-complete:hover {
    background: #666;
    border-color: #666;
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

/* Секция цены */
.price-section {
    padding: 1.5rem;
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
    color: #333;
    cursor: pointer;
    text-decoration: underline;
    font-size: 0.9rem;
    font-weight: 500;
}

.btn-link:hover {
    color: #666;
}

/* Прогресс */
.progress-section {
    margin-top: 1rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
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
    background: #10b981;
    border-color: #10b981;
}

.step-label {
    font-size: 0.8rem;
    color: #666;
    text-align: center;
    font-weight: 500;
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
    font-weight: 600;
    margin-top: 0.5rem;
}

/* Цена в мета-информации */
.order-price-large {
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
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
    padding: 2rem;
}

.modal-content {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    max-width: 500px;
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

.order-preview {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #333;
}

.order-preview h4 {
    margin: 0 0 0.5rem 0;
    color: #1a1a1a;
    font-size: 1.2rem;
}

.order-preview .description {
    color: #666;
    font-style: italic;
    margin: 0;
    line-height: 1.5;
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
    font-weight: 600;
    color: #1a1a1a;
    font-size: 0.9rem;
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
    border-color: #333;
}

.price-suggestions {
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.suggestion-label {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.75rem;
    font-weight: 500;
}

.suggestion-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.btn-suggestion {
    padding: 0.75rem 1rem;
    background: white;
    border: 1px solid #e1e1e1;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    font-weight: 500;
}

.btn-suggestion:hover {
    border-color: #333;
    background: #f0fdf4;
    color: #333;
}

.price-preview {
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #333;
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
    color: #333;
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

    .master-actions {
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

    .modal-content {
        margin: 1rem;
        width: calc(100% - 2rem);
    }

    .modal-footer {
        flex-direction: column;
    }

    .suggestion-buttons {
        justify-content: center;
    }
}

/* Анимации */
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
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