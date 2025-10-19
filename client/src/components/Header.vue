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
        <router-link to="/" class="nav-link"> Главная </router-link>
        <router-link to="/services" class="nav-link"> Сервисы </router-link>
        <router-link to="/about" class="nav-link"> О нас </router-link>

        <template v-if="isAuthenticated">
          <!-- Профиль всегда виден -->


          <!-- Только для клиента: "Мои заявки" -->
          <router-link v-if="isClient || isAdmin || isManager" to="/orders" class="nav-link">
            Мои заявки
          </router-link>

          <!-- Панели управления: только свои -->
          <div class="admin-panels" v-if="isManager || isMaster || isAdmin">
            <router-link v-if="isManager || isAdmin" to="/manager" class="nav-link">
              Менеджер
            </router-link>
            <router-link v-if="isMaster || isAdmin" to="/master" class="nav-link">
              Мастер
            </router-link>
            <router-link v-if="isAdmin" to="/admin" class="nav-link">
              Админ
            </router-link>
          </div>

          <!-- Информация пользователя -->
            <router-link to="/profile" class="user-link">
              <img :src="userAvatar" :alt="userName" @error="handleAvatarError" class="user-avatar" />
              <div class="user-details">
                <span class="user-name">{{ userName }}</span>
                <span class="user-role">{{ userRoleLabel }}</span>
              </div>
            </router-link>
        </template>

        <template v-else>
          <router-link to="/auth" class="nav-link login-link"> Войти </router-link>
        </template>
      </nav>

      <!-- Мобильное меню -->
      <button @click="toggleMobileMenu" class="mobile-menu-btn"> ☰ </button>
    </div>

    <!-- Мобильное меню оверлей -->
    <div v-if="showMobileMenu" class="mobile-menu-overlay" @click="showMobileMenu = false">
      <div class="mobile-menu" @click.stop>
        <div class="mobile-menu-header">
          <div class="user-info" v-if="isAuthenticated">
            <div class="user-avatar">
              <img :src="userAvatar" :alt="userName" @error="handleAvatarError" />
            </div>
            <div class="user-details">
              <span class="user-name">{{ userName }}</span>
              <span class="user-role">{{ userRoleLabel }}</span>
            </div>
          </div>
          <button @click="showMobileMenu = false" class="close-btn">×</button>
        </div>

        <nav class="mobile-nav">
          <router-link to="/" class="mobile-nav-link" @click="showMobileMenu = false">
            Главная
          </router-link>
          <router-link to="/services" class="mobile-nav-link" @click="showMobileMenu = false">
            Сервисы
          </router-link>
          <router-link to="/about" class="mobile-nav-link" @click="showMobileMenu = false">
            О нас
          </router-link>

          <template v-if="isAuthenticated">
            <router-link to="/profile" class="mobile-nav-link" @click="showMobileMenu = false">
              👤 Профиль
            </router-link>

            <router-link v-if="isClient" to="/orders" class="mobile-nav-link" @click="showMobileMenu = false">
              Мои заявки
            </router-link>

            <div class="mobile-admin-panels" v-if="isManager || isMaster || isAdmin">
              <router-link v-if="isManager" to="/manager" class="mobile-nav-link manager-link"
                @click="showMobileMenu = false">
                Панель менеджера
              </router-link>
              <router-link v-if="isMaster" to="/master" class="mobile-nav-link master-link"
                @click="showMobileMenu = false">
                Панель мастера
              </router-link>
              <router-link v-if="isAdmin" to="/admin" class="mobile-nav-link admin-link"
                @click="showMobileMenu = false">
                Админ-панель
              </router-link>
            </div>

            <button @click="logoutMobile" class="mobile-logout-btn"> Выйти </button>
          </template>

          <template v-else>
            <router-link to="/auth" class="mobile-nav-link login-link" @click="showMobileMenu = false">
              Войти в систему
            </router-link>
          </template>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
import { useAuthStore } from '@/stores/authStore'
import { computed, ref } from 'vue'

export default {
  name: 'AppHeader',

  setup() {
    const authStore = useAuthStore()
    const showMobileMenu = ref(false)

    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const userRole = computed(() => authStore.userRole)

    // Роли
    const isClient = computed(() => userRole.value === 'client')
    const isMaster = computed(() => userRole.value === 'master')
    const isManager = computed(() => userRole.value === 'manager')
    const isAdmin = computed(() => userRole.value === 'admin')

    const userName = computed(() => {
      if (authStore.user) {
        return `${authStore.user.firstName} ${authStore.user.lastName}`
      }
      return 'Пользователь'
    })

    const userAvatar = computed(() => {
      return authStore.user?.avatar || '/src/assets/avatar.png'
    })

    const userRoleLabel = computed(() => {
      const roles = {
        client: 'Клиент',
        master: 'Мастер',
        manager: 'Менеджер',
        admin: 'Администратор'
      }
      return roles[userRole.value] || 'Пользователь'
    })

    const toggleMobileMenu = () => {
      showMobileMenu.value = !showMobileMenu.value
    }

    const logout = () => {
      if (confirm('Вы уверены, что хотите выйти?')) {
        authStore.logout()
        window.location.href = '/'
      }
    }

    const logoutMobile = () => {
      authStore.logout()
      showMobileMenu.value = false
      window.location.href = '/'
    }

    const handleAvatarError = (event) => {
      event.target.src = '/src/assets/avatar.png'
    }

    return {
      isAuthenticated,
      isClient,
      isMaster,
      isManager,
      isAdmin,
      userName,
      userAvatar,
      userRoleLabel,
      showMobileMenu,
      toggleMobileMenu,
      logout,
      logoutMobile,
      handleAvatarError
    }
  }
}
</script>

<style scoped>
/* Стили остаются БЕЗ изменений — они уже отлично подходят */
.header {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.logo-link {
  text-decoration: none;
  font-weight: 700;
  font-size: 1.4rem;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: transform 0.3s ease;
}



.logo-pro {
  background: linear-gradient(135deg, #1a1a1a, #333);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.nav {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.nav-link {
  color: #555;
  text-decoration: none;
  font-weight: 500;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  font-size: 0.9rem;
  white-space: nowrap;
}

.nav-link:hover {
  color: #1a1a1a;
  background: #f8f9fa;
  transform: translateY(-1px);
}

.nav-link.router-link-active {
  color: #1a1a1a;
  background: #f0f0f0;
  font-weight: 600;
}

.user-link {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  color: #555;
  text-decoration: none;
  font-weight: 500;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  font-size: 0.9rem;
  white-space: nowrap;
}

.user-link:hover {
  color: #1a1a1a;
  background: #e5e5e6;
}


.login-link {
  background: linear-gradient(135deg, #1a1a1a, #333);
  color: white;
  font-weight: 600;
}

.login-link:hover {
  background: linear-gradient(135deg, #333, #555);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(26, 26, 26, 0.3);
}

.admin-panels {
  display: flex;
  gap: 0.5rem;
  margin: 0 0.5rem;
}

.manager-link {
  background: #e3f2fd;
  font-size: 0.85rem;
  padding: 0.5rem 0.8rem;
}

.manager-link:hover {
  background: #888;
}

.master-link {
  background: #e8f5e8;
  color: #2e7d32;
  font-size: 0.85rem;
  padding: 0.5rem 0.8rem;
}

.master-link:hover {
  background: #c8e6c9;
  color: #1b5e20;
}

.admin-link {
  background: #fff3e0;
  color: #ef6c00;
  font-size: 0.85rem;
  padding: 0.5rem 0.8rem;
}

.admin-link:hover {
  background: #ffe0b2;
  color: #e65100;
}

.user-menu {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: #e9ecef;
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
  font-size: 0.9rem;
  line-height: 1.2;
}

.user-role {
  font-size: 0.75rem;
  color: #666;
  line-height: 1.2;
}

.logout-btn {
  background: none;
  border: 1px solid #dc3545;
  color: #dc3545;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 40px;
}

.logout-btn:hover {
  background: #dc3545;
  color: white;
  transform: scale(1.05);
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #1a1a1a;
}

.mobile-menu-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 300px;
  background: white;
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
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
}

.close-btn:hover {
  background: #e9ecef;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
  flex: 1;
  overflow-y: auto;
}

.mobile-nav-link {
  padding: 1rem 1.5rem;
  text-decoration: none;
  color: #333;
  border-bottom: 1px solid #f8f9fa;
  transition: background 0.3s ease;
  font-size: 0.95rem;
}

.mobile-nav-link:hover {
  background: #f8f9fa;
}

.mobile-nav-link.router-link-active {
  background: #e9ecef;
  color: #1a1a1a;
  font-weight: 600;
}

.mobile-admin-panels {
  border-top: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
  margin: 0.5rem 0;
  padding: 0.5rem 0;
}

.mobile-logout-btn {
  margin: 1rem 1.5rem;
  padding: 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease;
}

.mobile-logout-btn:hover {
  background: #c82333;
}

@media (max-width: 1024px) {
  .nav {
    gap: 0.5rem;
  }

  .nav-link {
    padding: 0.5rem 0.8rem;
    font-size: 0.85rem;
  }

  .user-name {
    display: none;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .nav {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .mobile-menu-overlay {
    display: block;
  }

  .logo-link {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0.75rem;
  }

  .mobile-menu {
    width: 100%;
  }

  .logo-text {
    font-size: 1.1rem;
  }

  .logo-pro {
    font-size: 0.7rem;
    padding: 0.15rem 0.4rem;
  }
}
</style>