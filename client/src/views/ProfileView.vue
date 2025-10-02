<template>
  <div v-if="user">
    <Profile
      :user="user"
      :orders="orders"
      :current-order="currentOrder"
      @update-profile="handleUpdate"
      @logout="handleLogout"
    />
  </div>
  <div v-else class="loading">Загрузка...</div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { getUserOrders } from '@/api/auth';
import Profile from '@/components/Profile.vue';

export default {
  name: 'ProfileView',
  components: { Profile },
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const toast = useToast();
    return { authStore, router, toast };
  },
  computed: {
    user() {
      return this.authStore.user;
    },
    token() {
      return this.authStore.token;
    }
  },
  data() {
    return {
      orders: [],
      currentOrder: null
    };
  },
  methods: {
    async handleUpdate(data) {
      try {
        await this.authStore.updateUser(data);
        this.toast.success('Профиль обновлён!');
      } catch (error) {
        this.toast.error(error.response?.data?.message || 'Ошибка');
      }
    },
    handleLogout() {
      this.authStore.logout();
      this.router.push('/auth');
    },
    async fetchOrders() {
      try {
        this.orders = await getUserOrders(this.token, this.user._id) || [];
        this.currentOrder = this.orders.find(o => o.status === 'in_progress') || null;
      } catch (error) {
        this.toast.error('Ошибка загрузки заявок');
      }
    }
  },
  mounted() {
    if (!this.authStore.isAuthenticated) {
      this.router.push('/auth');
    } else {
      this.fetchOrders();
    }
  }
};
</script>

<style scoped>
.loading {
  text-align: center;
  padding: 20px;
}
</style>