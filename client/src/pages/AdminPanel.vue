<template>
    <div class="panel-page">
        <!-- Hero секция -->
        <section class="page-hero">
            <div class="container">
                <div class="hero-content">
                    <h1 class="hero-title">Админ-панель</h1>
                    <p class="hero-subtitle">Полный контроль над системой и пользователями</p>
                </div>
            </div>
        </section>

        <!-- Статистика -->
        <section class="stats-section">
            <div class="container">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-info">
                            <i class="pi pi-user" style="font-size: 2.5rem"></i>
                            <div class="stat-number">{{ stats.totalUsers }}</div>
                        </div>
                        <div class="stat-label">Всего пользователей</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <i class="pi pi-spin pi-cog" style="font-size: 2rem"></i>
                            <div class="stat-number">{{ stats.masters }}</div>
                        </div>
                        <div class="stat-label">Мастеров</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <i class="pi pi-briefcase" style="font-size: 2.5rem"></i>
                            <div class="stat-number">{{ stats.managers }}</div>
                        </div>
                        <div class="stat-label">Менеджеров</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <i class="pi pi-file" style="font-size: 2.5rem"></i>
                            <div class="stat-number">{{ stats.orders }}</div>
                        </div>
                        <div class="stat-label">Заявок всего</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Управление пользователями -->
        <section class="users-section">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Управление пользователями</h2>
                    <div class="section-actions">
                        <button @click="showUserModal = true" class="btn btn-primary">
                            <i class="pi pi-plus"></i> Добавить пользователя
                        </button>
                        <input v-model="userSearch" type="text" placeholder="Поиск пользователей..."
                            class="search-input" />
                    </div>
                </div>

                <!-- Фильтры ролей -->
                <div class="role-filters">
                    <button v-for="filter in roleFilters" :key="filter.key" @click="setRoleFilter(filter.key)"
                        :class="['filter-btn', { active: currentRoleFilter === filter.key }]">
                        {{ filter.label }}
                    </button>
                </div>

                <!-- Таблица пользователей -->
                <div class="users-table-container">
                    <div class="users-table">
                        <div class="table-header">
                            <div class="table-col user-col">Пользователь</div>
                            <div class="table-col">Email</div>
                            <div class="table-col">Роль</div>
                            <div class="table-col">Телефон</div>
                            <div class="table-col">Статус</div>
                            <div class="table-col">Дата регистрации</div>
                            <div class="table-col actions-col">Действия</div>
                        </div>

                        <div v-if="loadingUsers" class="loading-state">
                            <div class="spinner"></div>
                            <span>Загружаем пользователей...</span>
                        </div>

                        <div v-else class="table-body">
                            <div v-for="user in filteredUsers" :key="user._id" class="table-row">
                                <div class="table-col user-col">
                                    <div class="user-info">
                                        <div class="user-avatar">
                                            <img :src="user.avatar || '/src/assets/avatar.png'" :alt="user.firstName"
                                                @error="handleAvatarError" />
                                        </div>
                                        <div class="user-details">
                                            <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                                            <span class="user-id">ID: {{ user._id.slice(-6) }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="table-col">{{ user.email }}</div>
                                <div class="table-col">
                                    <select :value="user.role" @change="updateUserRole(user, $event.target.value)"
                                        class="role-select" :disabled="user._id === authStore.user?.id">
                                        <option value="client">Клиент</option>
                                        <option value="master">Мастер</option>
                                        <option value="manager">Менеджер</option>
                                        <option value="admin">Администратор</option>
                                    </select>
                                </div>
                                <div class="table-col">{{ user.phone || 'Не указан' }}</div>
                                <div class="table-col">
                                    <span class="status-badge" :class="user.isActive ? 'active' : 'inactive'">
                                        {{ user.isActive ? 'Активен' : 'Неактивен' }}
                                    </span>
                                </div>
                                <div class="table-col">{{ formatDate(user.createdAt) }}</div>
                                <div class="table-col actions-col">
                                    <div class="action-buttons">
                                        <button @click="editUser(user)" class="btn-icon" title="Редактировать">
                                            <i class="pi pi-pencil" style="color: orange;"></i>
                                        </button>
                                        <button @click="toggleUserStatus(user)" class="btn-icon"
                                            :title="user.isActive ? 'Деактивировать' : 'Активировать'"
                                            :disabled="user._id === authStore.user?.id">
                                            <i :class="user.isActive ? 'pi pi-pause' : 'pi pi-play'"></i>
                                        </button>
                                        <button v-if="user._id !== authStore.user?.id" @click="deleteUser(user)"
                                            class="btn-icon danger" title="Удалить">
                                            <i class="pi pi-trash" style="color: red;"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Пустое состояние -->
                <div v-if="!loadingUsers && filteredUsers.length === 0" class="empty-state">
                    <i class="pi pi-users" style="font-size: 4rem; opacity: 0.5"></i>
                    <h3>Пользователи не найдены</h3>
                    <p>Попробуйте изменить критерии поиска</p>
                </div>
            </div>
        </section>

        <!-- Детальная статистика по ролям -->
        <section class="roles-section">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Статистика по ролям</h2>
                </div>

                <div class="roles-grid">
                    <div class="role-card">
                        <div class="role-header">
                            <i class="pi pi-users" style="font-size: 2.5rem"></i>
                            <h3>Клиенты</h3>
                        </div>
                        <div class="role-stats">
                            <div class="role-stat">
                                <span class="stat-value">{{ roleStats.clients.total }}</span>
                                <span class="stat-label">Всего</span>
                            </div>
                            <div class="role-stat">
                                <span class="stat-value">{{ roleStats.clients.active }}</span>
                                <span class="stat-label">Активных</span>
                            </div>
                            <div class="role-stat">
                                <span class="stat-value">{{ roleStats.clients.orders }}</span>
                                <span class="stat-label">Заявок</span>
                            </div>
                        </div>
                    </div>

                    <div class="role-card">
                        <div class="role-header">
                            <i class="pi pi-spin pi-cog" style="font-size: 2.2rem"></i>
                            <h3>Мастера</h3>
                        </div>
                        <div class="role-stats">
                            <div class="role-stat">
                                <span class="stat-value">{{ roleStats.masters.total }}</span>
                                <span class="stat-label">Всего</span>
                            </div>
                            <div class="role-stat">
                                <span class="stat-value">{{ roleStats.masters.active }}</span>
                                <span class="stat-label">Активных</span>
                            </div>
                            <div class="role-stat">
                                <span class="stat-value">{{ roleStats.masters.specialization }}</span>
                                <span class="stat-label">Специализаций</span>
                            </div>
                        </div>
                        <div class="masters-list">
                            <div v-for="master in masters" :key="master._id" class="master-item">
                                <span class="master-name">{{ master.firstName }} {{ master.lastName }}</span>
                                <span class="master-spec">{{ master.specialization || 'Общая' }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="role-card">
                        <div class="role-header">
                            <i class="pi pi-briefcase" style="font-size: 2.5rem"></i>
                            <h3>Менеджеры</h3>
                        </div>
                        <div class="role-stats">
                            <div class="role-stat">
                                <span class="stat-value">{{ roleStats.managers.total }}</span>
                                <span class="stat-label">Всего</span>
                            </div>
                            <div class="role-stat">
                                <span class="stat-value">{{ roleStats.managers.active }}</span>
                                <span class="stat-label">Активных</span>
                            </div>
                            <div class="role-stat">
                                <span class="stat-value">{{ roleStats.managers.assigned }}</span>
                                <span class="stat-label">Назначенных заявок</span>
                            </div>
                        </div>
                        <div class="managers-list">
                            <div v-for="manager in managers" :key="manager._id" class="manager-item">
                                <span class="manager-name">{{ manager.firstName }} {{ manager.lastName }}</span>
                                <span class="manager-email">{{ manager.email }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Модальное окно добавления пользователя -->
        <div v-if="showUserModal" class="modal-overlay" @click="showUserModal = false">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Добавить пользователя</h3>
                    <button @click="showUserModal = false" class="close-btn">×</button>
                </div>

                <div class="modal-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Имя *</label>
                            <input v-model="newUser.firstName" type="text" class="form-input" required />
                        </div>
                        <div class="form-group">
                            <label>Фамилия *</label>
                            <input v-model="newUser.lastName" type="text" class="form-input" required />
                        </div>
                        <div class="form-group">
                            <label>Email *</label>
                            <input v-model="newUser.email" type="email" class="form-input" required />
                        </div>
                        <div class="form-group">
                            <label>Пароль *</label>
                            <input v-model="newUser.password" type="password" class="form-input" required />
                        </div>
                        <div class="form-group">
                            <label>Телефон</label>
                            <input v-model="newUser.phone" type="tel" class="form-input"
                                placeholder="+7 (999) 999-99-99" />
                        </div>
                        <div class="form-group">
                            <label>Роль *</label>
                            <select v-model="newUser.role" class="form-input" required @change="onRoleChange">
                                <option value="client">Клиент</option>
                                <option value="master">Мастер</option>
                                <option value="manager">Менеджер</option>
                                <option value="admin">Администратор</option>
                            </select>
                        </div>
                        <div class="form-group" v-if="newUser.role === 'master'">
                            <label>Специализация</label>
                            <select v-model="newUser.specialization" class="form-input">
                                <option value="">Общая специализация</option>
                                <option value="Ноутбуки">Ноутбуки</option>
                                <option value="Смартфоны">Смартфоны</option>
                                <option value="Компьютеры">Компьютеры</option>
                                <option value="Планшеты">Планшеты</option>
                                <option value="Игровые консоли">Игровые консоли</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button @click="showUserModal = false" class="btn btn-outline">Отмена</button>
                    <button @click="createUser" class="btn btn-primary" :disabled="!isFormValid">
                        Создать пользователя
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { adminService } from '@/services/adminService'
import { orderService } from '@/services/orderService'

export default {
    name: 'AdminPanel',

    setup() {
        const authStore = useAuthStore()
        const users = ref([])
        const allOrders = ref([])
        const loadingUsers = ref(false)
        const showUserModal = ref(false)
        const userSearch = ref('')
        const currentRoleFilter = ref('all')

        const newUser = ref({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phone: '',
            role: 'client',
            specialization: ''
        })

        const roleFilters = [
            { key: 'all', label: 'Все пользователи' },
            { key: 'client', label: 'Клиенты' },
            { key: 'master', label: 'Мастера' },
            { key: 'manager', label: 'Менеджеры' },
            { key: 'admin', label: 'Администраторы' }
        ]

        const loadUsers = async () => {
            try {
                loadingUsers.value = true
                const response = await adminService.getUsers()
                users.value = response.users
                console.log('Пользователи загружены:', users.value.length)
            } catch (error) {
                console.error('Ошибка загрузки пользователей:', error)
                alert('Ошибка загрузки пользователей: ' + error.message)
            } finally {
                loadingUsers.value = false
            }
        }

        const loadAllOrders = async () => {
            try {
                const response = await orderService.getMyOrders()
                allOrders.value = response
            } catch (error) {
                console.error('Ошибка загрузки заявок:', error)
            }
        }

        const createUser = async () => {
            try {
                const response = await adminService.createUser(newUser.value)
                users.value.unshift(response.user)
                showUserModal.value = false
                newUser.value = {
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    phone: '',
                    role: 'client',
                    specialization: ''
                }
                alert(response.message)
            } catch (error) {
                console.error('Ошибка создания пользователя:', error)
                alert('Ошибка создания пользователя: ' + error.message)
            }
        }

        const updateUserRole = async (user, newRole) => {
            try {
                const roleData = { role: newRole }
                if (newRole === 'master') {
                    roleData.specialization = user.specialization || 'Общая'
                }
                const response = await adminService.updateUserRole(user._id, roleData)
                user.role = newRole
                alert(response.message)
            } catch (error) {
                console.error('Ошибка обновления роли:', error)
                alert('Ошибка обновления роли: ' + error.message)
            }
        }

        const toggleUserStatus = async (user) => {
            try {
                const response = await adminService.toggleUserStatus(user._id)
                user.isActive = !user.isActive
                alert(response.message)
            } catch (error) {
                console.error('Ошибка изменения статуса:', error)
                alert('Ошибка изменения статуса: ' + error.message)
            }
        }

        const deleteUser = async (user) => {
            if (confirm(`Удалить пользователя ${user.firstName} ${user.lastName}?`)) {
                try {
                    const response = await adminService.deleteUser(user._id)
                    users.value = users.value.filter(u => u._id !== user._id)
                    alert(response.message)
                } catch (error) {
                    console.error('Ошибка удаления пользователя:', error)
                    alert('Ошибка удаления: ' + error.message)
                }
            }
        }

        const filteredUsers = computed(() => {
            let filtered = users.value
            if (currentRoleFilter.value !== 'all') {
                filtered = filtered.filter(user => user.role === currentRoleFilter.value)
            }
            if (userSearch.value) {
                const query = userSearch.value.toLowerCase()
                filtered = filtered.filter(user =>
                    user.firstName.toLowerCase().includes(query) ||
                    user.lastName.toLowerCase().includes(query) ||
                    user.email.toLowerCase().includes(query) ||
                    (user.phone && user.phone.toLowerCase().includes(query))
                )
            }
            return filtered
        })

        const masters = computed(() => {
            return users.value.filter(user => user.role === 'master' && user.isActive)
        })

        const managers = computed(() => {
            return users.value.filter(user => user.role === 'manager' && user.isActive)
        })

        const stats = computed(() => {
            const totalUsers = users.value.length
            const mastersCount = users.value.filter(user => user.role === 'master').length
            const managersCount = users.value.filter(user => user.role === 'manager').length
            const ordersCount = allOrders.value.length
            return {
                totalUsers,
                masters: mastersCount,
                managers: managersCount,
                orders: ordersCount
            }
        })

        const roleStats = computed(() => {
            const clients = users.value.filter(user => user.role === 'client')
            const masters = users.value.filter(user => user.role === 'master')
            const managers = users.value.filter(user => user.role === 'manager')

            const clientOrders = allOrders.value.reduce((acc, order) => {
                acc[order.user] = (acc[order.user] || 0) + 1
                return acc
            }, {})

            return {
                clients: {
                    total: clients.length,
                    active: clients.filter(user => user.isActive).length,
                    orders: clients.reduce((sum, user) => sum + (clientOrders[user._id] || 0), 0)
                },
                masters: {
                    total: masters.length,
                    active: masters.filter(user => user.isActive).length,
                    specialization: new Set(masters.map(m => m.specialization).filter(Boolean)).size
                },
                managers: {
                    total: managers.length,
                    active: managers.filter(user => user.isActive).length,
                    assigned: allOrders.value.filter(order => order.assignedManager).length
                }
            }
        })

        const isFormValid = computed(() => {
            return (
                newUser.value.firstName &&
                newUser.value.lastName &&
                newUser.value.email &&
                newUser.value.password &&
                newUser.value.role
            )
        })

        const setRoleFilter = (filter) => {
            currentRoleFilter.value = filter
        }

        const onRoleChange = () => {
            if (newUser.value.role !== 'master') {
                newUser.value.specialization = ''
            }
        }

        const editUser = (user) => {
            alert(`Редактирование пользователя: ${user.firstName} ${user.lastName}\n\nЗдесь будет форма редактирования`)
        }

        const handleAvatarError = (event) => {
            event.target.src = '/src/assets/avatar.png'
        }

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('ru-RU')
        }

        onMounted(async () => {
            if (authStore.userRole !== 'admin') {
                alert('Доступ запрещен')
                return
            }
            await Promise.all([loadUsers(), loadAllOrders()])
        })

        return {
            authStore,
            users,
            loadingUsers,
            showUserModal,
            userSearch,
            currentRoleFilter,
            roleFilters,
            newUser,
            filteredUsers,
            masters,
            managers,
            stats,
            roleStats,
            isFormValid,
            loadUsers,
            setRoleFilter,
            onRoleChange,
            createUser,
            updateUserRole,
            toggleUserStatus,
            deleteUser,
            editUser,
            handleAvatarError,
            formatDate
        }
    }
}
</script>

<style scoped>
/* Общие стили панели */
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
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    background: white;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}
.stat-info {
    display: flex;
    gap: 5px;
    align-items: center;
}
.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    font-size: 3rem;
    margin-right: 1.5rem;
}

.stat-number {
    font-size: 2.5rem;
    font-weight: 600;
    color: #1a1a1a;
}

.stat-label {
    color: #666;
    font-size: 0.9rem;
}

/* Секция пользователей */
.users-section {
    padding: 3rem 0;
    background: white;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.section-title {
    font-size: 2rem;
    font-weight: 300;
    color: #1a1a1a;
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
}

.search-input:focus {
    outline: none;
    border-color: #1a1a1a;
}

/* Фильтры ролей */
.role-filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
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
}

.filter-btn:hover {
    border-color: #1a1a1a;
}

.filter-btn.active {
    background: #1a1a1a;
    color: white;
    border-color: #1a1a1a;
}

/* Таблица пользователей */
.users-table-container {
    background: white;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.users-table {
    width: 100%;
}

.table-header {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 1fr 1fr;
    gap: 1rem;
    padding: 1.5rem 2rem;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    font-weight: 600;
    color: #1a1a1a;
    font-size: 0.9rem;
}

.table-body {
    max-height: 600px;
    overflow-y: auto;
}

.table-row {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 1fr 1fr;
    gap: 1rem;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #f8f9fa;
    transition: background 0.3s ease;
}

.table-row:hover {
    background: #f8f9fa;
}

.table-row:last-child {
    border-bottom: none;
}

.table-col {
    display: flex;
    align-items: center;
}

.user-col {
    padding-right: 1rem;
}

.actions-col {
    justify-content: flex-end;
}

/* Информация о пользователе */
.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-details {
    display: flex;
    flex-direction: column;
}

.user-name {
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 0.25rem;
}

.user-id {
    font-size: 0.8rem;
    color: #666;
}

/* Селектор роли */
.role-select {
    padding: 0.5rem;
    border: 1px solid #e1e1e1;
    border-radius: 6px;
    background: white;
    font-size: 0.9rem;
    min-width: 120px;
}

.role-select:focus {
    outline: none;
    border-color: #1a1a1a;
}

.role-select:disabled {
    background: #f8f9fa;
    color: #666;
}

/* Бейдж статуса */
.status-badge {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
}

.status-badge.active {
    background: #d4edda;
    color: #155724;
}

.status-badge.inactive {
    background: #f8d7da;
    color: #721c24;
}

/* Кнопки действий */
.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.btn-icon {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 6px;
    transition: background 0.3s ease;
    font-size: 1rem;
}

.btn-icon:hover {
    background: #f8f9fa;
}

.btn-icon.danger:hover {
    background: #f8d7da;
}

.btn-icon:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Секция ролей */
.roles-section {
    padding: 3rem 0;
    background: #f8f9fa;
}

.roles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.role-card {
    background: white;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.role-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.role-icon {
    font-size: 2.5rem;
}

.role-header h3 {
    margin: 0;
    color: #1a1a1a;
    font-size: 1.3rem;
}

.role-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.role-stat {
    text-align: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.stat-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 0.25rem;
}

.stat-label {
    font-size: 0.8rem;
    color: #666;
}

/* Списки мастеров и менеджеров */
.masters-list,
.managers-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.master-item,
.manager-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: #f8f9fa;
    border-radius: 6px;
}

.master-name,
.manager-name {
    font-weight: 500;
    color: #1a1a1a;
}

.master-spec {
    font-size: 0.8rem;
    color: #666;
    background: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
}

.manager-email {
    font-size: 0.8rem;
    color: #666;
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
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

.modal-footer {
    padding: 1rem 2rem 2rem;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    border-top: 1px solid #f0f0f0;
}

/* Форма */
.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group:last-child:nth-child(odd) {
    grid-column: 1 / -1;
}

.form-group label {
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #1a1a1a;
    font-size: 0.9rem;
}

.form-input {
    padding: 0.75rem 1rem;
    border: 1px solid #e1e1e1;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

.form-input:focus {
    outline: none;
    border-color: #1a1a1a;
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
    border-radius: 8px;
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
    border: 3px solid #f3f3f3;
    border-top: 3px solid #1a1a1a;
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

.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #666;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
    opacity: 0.5;
}

.empty-state h3 {
    margin: 0 0 1rem 0;
    color: #1a1a1a;
}

.empty-state p {
    margin: 0;
}

/* Адаптивность */
@media (max-width: 1200px) {

    .table-header,
    .table-row {
        grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 1fr;
    }

    .user-id {
        display: none;
    }
}

@media (max-width: 968px) {

    .table-header,
    .table-row {
        grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr;
    }

    .table-col:nth-child(4) {
        /* Телефон */
        display: none;
    }
}

@media (max-width: 768px) {
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

    .table-header,
    .table-row {
        grid-template-columns: 2fr 1fr 1fr;
        gap: 0.5rem;
        padding: 1rem;
    }

    .table-col:nth-child(2),
    /* Email */
    .table-col:nth-child(5),
    /* Дата */
    .table-col:nth-child(6) {
        /* Статус */
        display: none;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .roles-grid {
        grid-template-columns: 1fr;
    }

    .role-stats {
        grid-template-columns: 1fr;
    }

    .modal-content {
        margin: 1rem;
        width: calc(100% - 2rem);
    }
}

@media (max-width: 480px) {

    .table-header,
    .table-row {
        grid-template-columns: 1fr 1fr;
    }

    .table-col:nth-child(3) {
        /* Роль */
        display: none;
    }

    .user-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .action-buttons {
        flex-direction: column;
    }
}
</style>