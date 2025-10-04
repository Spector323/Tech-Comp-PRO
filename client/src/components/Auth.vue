<template>
  <div class="auth-container">
    <h2>{{ currentForm === 'register' ? 'Регистрация' : 'Вход' }}</h2>
    <form @submit.prevent="currentForm === 'register' ? handleRegister() : handleLogin()">
      <input v-if="currentForm === 'register'" v-model="form.firstName" placeholder="Имя" required />
      <input v-if="currentForm === 'register'" v-model="form.lastName" placeholder="Фамилия" required />
      <input v-model="form.email" type="email" placeholder="Email" required />
      <input v-model="form.password" type="password" placeholder="Пароль" required />
      <button type="submit" class="btn-primary">
        {{ currentForm === 'register' ? 'Зарегистрироваться' : 'Войти' }}
      </button>
    </form>
    <p class="switch-form">
      {{ currentForm === 'register' ? 'Уже есть аккаунт?' : 'Нет аккаунта?' }}
      <button @click="toggleForm" class="btn-link">
        {{ currentForm === 'register' ? 'Войти' : 'Зарегистрироваться' }}
      </button>
    </p>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { register, login } from '@/service/authService';

export default {
  name: 'Auth',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const toast = useToast();
    return { authStore, router, toast };
  },
  data() {
    return {
      currentForm: 'register',
      form: {
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      }
    };
  },
  methods: {
    toggleForm() {
      this.currentForm = this.currentForm === 'register' ? 'login' : 'register';
      this.form.firstName = '';
      this.form.lastName = '';
      this.form.email = '';
      this.form.password = '';
    },
    async handleRegister() {
      try {
        await register({
          firstName: this.form.firstName,
          lastName: this.form.lastName,
          email: this.form.email,
          password: this.form.password
        });
        this.toast.success('Регистрация успешна! Теперь войдите.');
        this.currentForm = 'login';
      } catch (error) {
        this.toast.error(error.response?.data?.message || 'Ошибка регистрации');
      }
    },
    async handleLogin() {
      try {
        await this.authStore.login({
          email: this.form.email,
          password: this.form.password
        });
        const role = this.authStore.userRole;
        switch (role) {
          case 'client': this.router.push('/home'); break;
          case 'admin': this.router.push('/admin'); break;
          case 'manager': this.router.push('/manager'); break;
          case 'master': this.router.push('/master'); break;
          default: this.router.push('/auth');
        }
      } catch (error) {
        this.toast.error(error.response?.data?.message || 'Ошибка входа');
      }
    }
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 32px;
  text-align: center;
}

h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

input {
  padding: 12px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  font-size: 16px;
}

.btn-primary {
  padding: 12px;
  background: #333;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.btn-primary:hover {
  background: #555;
}

.switch-form {
  margin-top: 16px;
  font-size: 14px;
  color: #757575;
}

.btn-link {
  background: none;
  border: none;
  color: #333;
  text-decoration: underline;
  cursor: pointer;
}
</style>