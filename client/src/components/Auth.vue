<template>
  <div class="auth-page">
    <div class="auth-container">
      <h2>{{ isLogin ? 'Вход в аккаунт' : 'Регистрация' }}</h2>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <form @submit.prevent="handleAuth" class="auth-form">
        <!-- Поля для регистрации -->
        <div v-if="!isLogin" class="form-row">
          <div class="form-group">
            <label>Имя *</label>
            <input v-model="formData.firstName" type="text" required placeholder="Введите ваше имя"
              :class="{ 'input-error': errors.firstName }">
            <span v-if="errors.firstName" class="field-error">{{ errors.firstName }}</span>
          </div>
          <div class="form-group">
            <label>Фамилия *</label>
            <input v-model="formData.lastName" type="text" required placeholder="Введите вашу фамилию"
              :class="{ 'input-error': errors.lastName }">
            <span v-if="errors.lastName" class="field-error">{{ errors.lastName }}</span>
          </div>
        </div>

        <!-- Общие поля -->
        <div class="form-group">
          <label>Email *</label>
          <input v-model="formData.email" type="email" required placeholder="example@mail.ru"
            :class="{ 'input-error': errors.email }">
          <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label>Пароль *</label>
          <input v-model="formData.password" type="password" required placeholder="Не менее 6 символов" minlength="6"
            :class="{ 'input-error': errors.password }">
          <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться') }}
        </button>
      </form>

      <p class="toggle-text">
        {{ isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?' }}
        <button @click="toggleMode" class="toggle-btn">
          {{ isLogin ? 'Зарегистрироваться' : 'Войти' }}
        </button>
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'AuthPage',

  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const isLogin = ref(true)
    const loading = ref(false)
    const error = ref('')

    const formData = ref({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    })

    const errors = ref({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    })

    // Валидация email
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    // Валидация формы
    const validateForm = () => {
      errors.value = {
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      }

      let isValid = true

      if (!isLogin.value) {
        if (!formData.value.firstName.trim()) {
          errors.value.firstName = 'Имя обязательно'
          isValid = false
        } else if (formData.value.firstName.trim().length < 2) {
          errors.value.firstName = 'Имя должно содержать минимум 2 символа'
          isValid = false
        }

        if (!formData.value.lastName.trim()) {
          errors.value.lastName = 'Фамилия обязательна'
          isValid = false
        } else if (formData.value.lastName.trim().length < 2) {
          errors.value.lastName = 'Фамилия должна содержать минимум 2 символа'
          isValid = false
        }
      }

      if (!formData.value.email.trim()) {
        errors.value.email = 'Email обязателен'
        isValid = false
      } else if (!validateEmail(formData.value.email)) {
        errors.value.email = 'Введите корректный email'
        isValid = false
      }

      if (!formData.value.password) {
        errors.value.password = 'Пароль обязателен'
        isValid = false
      } else if (formData.value.password.length < 6) {
        errors.value.password = 'Пароль должен содержать минимум 6 символов'
        isValid = false
      }

      return isValid
    }

    // Переключение между входом и регистрацией
    const toggleMode = () => {
      isLogin.value = !isLogin.value
      error.value = ''
      errors.value = {
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      }
    }

    // Обработка авторизации
    const handleAuth = async () => {
      if (!validateForm()) {
        return
      }

      loading.value = true
      error.value = ''

      try {
        if (isLogin.value) {
          // Вход
          await authStore.login({
            email: formData.value.email,
            password: formData.value.password
          })
        } else {
          // Регистрация
          await authStore.register(formData.value)
        }

        // ✅ ПРАВИЛЬНОЕ МЕСТО ДЛЯ РЕДИРЕКТА:
        if (!authStore.user?.emailVerified) {
          router.push('/email-verification')
          // Редирект на страницу подтверждения если email не подтвержден
        } else {
          router.push('/')
        }

      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    return {
      isLogin,
      loading,
      error,
      formData,
      errors,
      toggleMode,
      handleAuth
    }
  }
}
</script>
<style scoped>
/* Стили остаются без изменений */
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f1f3f4 100%);
}

.auth-container {
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 480px;
  border: 1px solid #f0f0f0;
}

.auth-container h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #1a1a1a;
  font-size: 2rem;
  font-weight: 300;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
  border: 1px solid #ffcdd2;
  font-size: 14px;
}

.auth-form {
  margin: 2rem 0;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group {
  flex: 1;
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #1a1a1a;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #fafafa;
}

.form-group input:focus {
  outline: none;
  border-color: #1a1a1a;
  background: white;
  box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.1);
}

.form-group input.input-error {
  border-color: #c62828;
  background: #ffebee;
}

.field-error {
  color: #c62828;
  font-size: 12px;
  margin-top: 6px;
  display: block;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.submit-btn:hover {
  background: #333;
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.toggle-text {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.toggle-btn {
  background: none;
  border: none;
  color: #1a1a1a;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
  font-weight: 600;
}

.toggle-btn:hover {
  color: #333;
}

@media (max-width: 768px) {
  .auth-container {
    padding: 2rem;
    margin: 1rem;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>