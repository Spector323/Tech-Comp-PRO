<template>
  <div>
    <Register
      v-if="currentForm === 'register'"
      @register="handleRegister"
      @switch-to-login="currentForm = 'login'"
    />
    <Login
      v-if="currentForm === 'login'"
      @login="handleLogin"
      @switch-to-register="currentForm = 'register'"
    />
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import Register from '@/components/Register.vue';
import Login from '@/components/Login.vue';

export default {
  name: 'AuthView',
  components: { Register, Login },
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const toast = useToast();
    return { authStore, router, toast };
  },
  data() {
    return {
      currentForm: 'login'
    };
  },
  methods: {
    async handleRegister(data) {
      try {
        await this.authStore.register(data);
        this.toast.success('Регистрация успешна! Теперь войдите.');
        this.currentForm = 'login';
      } catch (error) {
        this.toast.error(error.response?.data?.message || 'Ошибка регистрации');
      }
    },
    async handleLogin(data) {
      try {
        await this.authStore.login(data);
        const role = this.authStore.userRole;
        switch (role) {
          case 'client': this.router.push('/profile'); break;
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