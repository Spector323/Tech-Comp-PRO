<template>
  <header class="header">
    <div class="container">
      <div class="logo">
        <router-link to="/" class="logo-link">
          <span class="logo-text">TECH KOMP</span>
          <span class="logo-pro">PRO</span>
        </router-link>
      </div>

      <nav class="nav">
        <router-link to="/" class="nav-link">Главная</router-link>
        <router-link to="/services" class="nav-link">Сервисы</router-link>
        <router-link to="/about" class="nav-link">О нас</router-link>
        
        <template v-if="isAuthenticated">
          <router-link to="/orders" class="nav-link">Мои заявки</router-link>
          <router-link to="/profile" class="nav-link">Профиль</router-link>
          
          <router-link v-if="isManager || isAdmin" to="/admin" class="nav-link admin-link">
            Админка
          </router-link>
          
          <router-link v-if="isMaster" to="/workshop" class="nav-link">
            Мастерская
          </router-link>
          
          <div class="user-menu">
            <span class="user-role">{{ userRoleLabel }}</span>
            <button @click="logout" class="logout-btn">
              Выйти
            </button>
          </div>
        </template>

        <template v-else>
          <router-link to="/auth" class="nav-link login-link">Войти</router-link>
        </template>
      </nav>
    </div>
  </header>
</template>

<script>
import { useAuthStore } from '@/stores/authStore'
import { computed } from 'vue'

export default {
  name: 'AppHeader',
  
  setup() {
    const authStore = useAuthStore()

    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const userRole = computed(() => authStore.userRole)
    const isAdmin = computed(() => authStore.isAdmin)
    const isManager = computed(() => authStore.isManager)
    const isMaster = computed(() => authStore.isMaster)

    const userRoleLabel = computed(() => {
      const roles = {
        'client': 'Клиент',
        'master': 'Мастер', 
        'manager': 'Менеджер',
        'admin': 'Администратор'
      }
      return roles[userRole.value] || 'Пользователь'
    })

    const logout = () => {
      if (confirm('Вы уверены, что хотите выйти?')) {
        authStore.logout()
        window.location.href = '/'
      }
    }

    return {
      isAuthenticated,
      userRoleLabel,
      isAdmin,
      isManager,
      isMaster,
      logout
    }
  }
}
</script>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.logo-link {
  text-decoration: none;
  font-weight: 600;
  font-size: 1.3rem;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.logo-pro {
  background: #1a1a1a;
  color: white;
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #1a1a1a;
  background: #f8f9fa;
}

.nav-link.router-link-active {
  color: #1a1a1a;
  background: #f8f9fa;
}

.login-link {
  background: #1a1a1a;
  color: white;
}

.login-link:hover {
  background: #333;
  color: white;
}

.admin-link {
  background: #fff3cd;
  color: #856404;
}

.admin-link:hover {
  background: #ffeaa7;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.user-role {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

.logout-btn {
  background: none;
  border: 1px solid #dc3545;
  color: #dc3545;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #dc3545;
  color: white;
}

/* Адаптивность */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .nav {
    gap: 1rem;
  }
  
  .nav-link {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
  
  .user-menu {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>