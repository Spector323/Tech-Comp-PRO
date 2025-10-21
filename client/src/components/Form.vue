<template>
  <div class="auth-form">
    <h2>{{ isLogin ? 'Вход в систему' : 'Регистрация' }}</h2>
    
    <form @submit.prevent="submitForm" class="form">
      <div v-if="!isLogin" class="form-group">
        <input
          v-model="formData.firstName"
          type="text"
          placeholder="Имя"
          class="form-input"
          required
        >
      </div>

      <div v-if="!isLogin" class="form-group">
        <input
          v-model="formData.lastName"
          type="text"
          placeholder="Фамилия"
          class="form-input"
          required
        >
      </div>

      <div class="form-group">
        <input
          v-model="formData.email"
          type="email"
          placeholder="Email"
          class="form-input"
          required
        >
      </div>

      <div class="form-group">
        <input
          v-model="formData.password"
          type="password"
          placeholder="Пароль"
          class="form-input"
          required
        >
      </div>

      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться') }}
      </button>
    </form>

    <div class="auth-switch">
      <p>
        {{ isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?' }}
        <button @click="toggleMode" class="btn-link">
          {{ isLogin ? 'Зарегистрироваться' : 'Войти' }}
        </button>
      </p>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'Form',
  emits: ['submit'],
  setup(props, { emit }) {
    const isLogin = ref(true);
    const loading = ref(false);
    const error = ref('');
    
    const formData = ref({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    });

    const toggleMode = () => {
      isLogin.value = !isLogin.value;
      error.value = '';
      formData.value = { firstName: '', lastName: '', email: '', password: '' };
    };

    const submitForm = async () => {
      loading.value = true;
      error.value = '';

      try {
        await emit('submit', {
          ...formData.value,
          isLogin: isLogin.value
        });
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    return {
      isLogin,
      loading,
      error,
      formData,
      toggleMode,
      submitForm
    };
  }
};
</script>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 0 auto;
}

.auth-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: var(--text-color);
}

.form {
  margin-bottom: 20px;
}

.btn-link {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

.btn-link:hover {
  color: var(--primary-hover);
}

.auth-switch {
  text-align: center;
  color: var(--text-light);
}

.error-message {
  background: var(--error-color);
  color: white;
  padding: 12px;
  border-radius: var(--border-radius);
  margin-top: 20px;
  text-align: center;
}
</style>