<template>
  <div class="auth-card">
    <h2>Вход</h2>
    <form @submit.prevent="onLogin">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Пароль" required />
      <button type="submit" class="btn-primary">Войти</button>
    </form>
    <p class="switch-link" @click="switchToRegister">Нет аккаунта? Зарегистрироваться</p>
  </div>
</template>

<script>
export default {
  emits: ['login', 'switch-to-register'],
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    onLogin() {
      this.$emit('login', { email: this.email, password: this.password });
    },
    switchToRegister() {
      this.$emit('switch-to-register');
    }
  }
};
</script>

<style scoped>
.auth-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  padding: 32px;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  margin-top: 250px;
}

.auth-card h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #2d2d2d;
}

input {
  width: 100%;
  padding: 14px 16px;
  margin-bottom: 16px;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  font-size: 16px;
  background: #ffffff;
  color: #2d2d2d;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  outline: none;
  border-color: #333;
  box-shadow: 0 0 0 3px rgba(29, 120, 217, 0.12);
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: #333;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #555;
}

.switch-link {
  display: block;
  text-align: center;
  margin-top: 16px;
  color: #333;
  cursor: pointer;
  font-size: 15px;
  text-decoration: none;
}

.switch-link:hover {
  text-decoration: underline;
}
</style>