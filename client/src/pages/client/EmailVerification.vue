<template>
  <div class="verification-page">
    <div class="container">
      <div class="verification-card">
        <h2>📧 Подтверждение Email</h2>
        
        <div v-if="!emailSent" class="verification-info">
          <p>Мы отправили письмо с подтверждением на <strong>{{ userEmail }}</strong></p>
          <p>Перейдите по ссылке в письме чтобы активировать аккаунт</p>
          
          <button @click="resendVerification" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Отправка...' : 'Отправить письмо повторно' }}
          </button>
        </div>

        <div v-else class="verification-success">
          <i class="pi pi-check-circle success-icon"></i>
          <p>Письмо отправлено! Проверьте вашу почту.</p>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'vue-toastification'

export default {
  name: 'EmailVerification',
  setup() {
    const authStore = useAuthStore()
    const toast = useToast()
    const emailSent = ref(false)
    const loading = ref(false)
    const error = ref('')

    const userEmail = computed(() => authStore.user?.email || '')
    // userEmail - получаем email из store

    const resendVerification = async () => {
      // resendVerification - отправка письма подтверждения
      loading.value = true
      error.value = ''

      try {
        const response = await fetch('http://localhost:3000/api/auth/resend-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify({ email: userEmail.value })
        })

        const data = await response.json()

        if (data.success) {
          emailSent.value = true
          toast.success('Письмо отправлено! Проверьте вашу почту.')
        } else {
          error.value = data.message
        }
      } catch (err) {
        error.value = 'Ошибка при отправке письма'
      } finally {
        loading.value = false
      }
    }

    return {
      userEmail,
      emailSent,
      loading,
      error,
      resendVerification
    }
  }
}
</script>

<style scoped>
.verification-page {
  padding: 2rem 0;
  min-height: 60vh;
}

.verification-card {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.success-icon {
  font-size: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}
</style>