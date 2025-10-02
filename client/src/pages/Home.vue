<template>
  <div class="home-container">
    <Header :user="user" @logout="onLogout" />
    <h1 v-if="user?.firstName">Добро пожаловать, {{ user.firstName }}!</h1>
    <h1 v-else>Добро пожаловать!</h1>
    <p>Это главная страница твоего приложения.</p>
    <!-- Здесь можно добавить дополнительный контент -->
  </div>
</template>

<script>
import Header from '@/components/Header.vue';

export default {
  name: 'Home',
  components: { Header },
  props: {
    user: { type: Object, required: false, default: () => ({}) } // Необязательный пропс
  },
  methods: {
    onLogout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/auth');
    }
  }
};
</script>

<style scoped>
.home-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 32px;
  text-align: center;
}

h1 {
  font-size: 28px;
  font-weight: 600;
  color: #2d2d2d;
  margin-bottom: 16px;
}

p {
  font-size: 16px;
  color: #757575;
}
</style>