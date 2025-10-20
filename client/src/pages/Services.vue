<template>
  <div class="services-page">
    <!-- Hero секция -->
    <section class="page-hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">Наши сервисы</h1>
          <p class="hero-subtitle">
            Полный спектр услуг по ремонту и обслуживанию техники от профессионалов
          </p>
        </div>
      </div>
    </section>

    <!-- Основные услуги -->
    <section class="main-services">
      <div class="container">
        <div class="services-grid">
          <div v-for="service in mainServices" :key="service.id" class="service-card-large">
            <div class="service-image">
              <div class="image-placeholder">{{ service.icon }}</div>
            </div>
            <div class="service-content">
              <h3 class="service-title">{{ service.title }}</h3>
              <p class="service-description">{{ service.description }}</p>
              <div class="service-features">
                <div v-for="feature in service.features" :key="feature" class="feature-item">
                  <span class="feature-check">✓</span>
                  {{ feature }}
                </div>
              </div>
              <div class="service-meta">
                <div class="meta-item">
                  <span class="meta-label">Срок:</span>
                  <span class="meta-value">{{ service.time }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Гарантия:</span>
                  <span class="meta-value">{{ service.warranty }}</span>
                </div>
              </div>
              <button v-if="!isAuthenticated" @click="$router.push('/auth')" class="btn btn-primary">
                Оставить заявку
              </button>
              <button v-else @click="$router.push('/orders')" class="btn btn-primary">
                Создать заявку
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Дополнительные услуги -->
    <section class="additional-services">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Дополнительные услуги</h2>
          <p class="section-subtitle">Специализированные услуги для вашей техники</p>
        </div>

        <div class="additional-grid">
          <div v-for="service in additionalServices" :key="service.id" class="additional-card">
            <div class="additional-icon">{{ service.icon }}</div>
            <h3 class="additional-title">{{ service.title }}</h3>
            <p class="additional-description">{{ service.description }}</p>
            <div class="additional-price">{{ service.price }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA секция -->
    <section class="services-cta">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">Нужна консультация?</h2>
          <p class="cta-description">
            Наши специалисты бесплатно проконсультируют вас по всем вопросам ремонта
          </p>
          <div class="cta-actions">
            <button class="btn btn-dark">Позвонить нам</button>
            <button class="btn btn-outline">Написать в WhatsApp</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'ServicesPage',

  setup() {
    const authStore = useAuthStore()

    const isAuthenticated = computed(() => authStore.isAuthenticated)

    const mainServices = [
      {
        id: 1,
        icon: '💻',
        title: 'Ремонт ноутбуков',
        description: 'Профессиональный ремонт ноутбуков всех производителей. От замены матрицы до ремонта материнской платы.',
        features: [
          'Бесплатная диагностика',
          'Оригинальные запчасти',
          'Чип-левел ремонт',
          'Срочный ремонт за 1-2 дня'
        ],
        time: '1-3 дня',
        warranty: '2 года'
      },
      {
        id: 2,
        icon: '🎮',
        title: 'Игровое оборудование',
        description: 'Ремонт игровых консолей и специализированной техники',
        features: [
          'Ремонт консолей',
          'Обслуживание геймпадов',
          'Апгрейд игровых ПК',
          'Настройка периферии'
        ],
        time: '1-2 дня',
        warranty: '1 год'
      },
      {
        id: 3,
        icon: '🖥️',
        title: 'Ремонт компьютеров',
        description: 'Обслуживание и ремонт стационарных ПК, моноблоков и компьютерной периферии.',
        features: [
          'Сборка и апгрейд ПК',
          'Замена комплектующих',
          'Чистка систем охлаждения',
          'Установка и настройка ПО'
        ],
        time: '1-2 дня',
        warranty: '2 года'
      }
    ]

    const additionalServices = [
      {
        id: 1,
        icon: '🎮',
        title: 'Ремонт игровых консолей',
        description: 'Ремонт PlayStation, Xbox и Nintendo Switch',
        price: 'от 1 500 ₽'
      },
      {
        id: 2,
        icon: '⌚',
        title: 'Ремонт умных часов',
        description: 'Восстановление Apple Watch и других смарт-часов',
        price: 'от 2 000 ₽'
      },
      {
        id: 3,
        icon: '📷',
        title: 'Ремонт фототехники',
        description: 'Обслуживание зеркальных и системных камер',
        price: 'от 3 000 ₽'
      },
      {
        id: 4,
        icon: '🔊',
        title: 'Ремонт аудиотехники',
        description: 'Восстановление колонок, наушников и аудиосистем',
        price: 'от 1 000 ₽'
      },
      {
        id: 5,
        icon: '🖨️',
        title: 'Обслуживание принтеров',
        description: 'Ремонт и заправка струйных и лазерных принтеров',
        price: 'от 800 ₽'
      },
      {
        id: 6,
        icon: '🔌',
        title: 'Ремонт блоков питания',
        description: 'Восстановление зарядных устройств и БП',
        price: 'от 500 ₽'
      }
    ]

    return {
      isAuthenticated,
      mainServices,
      additionalServices
    }
  }
}
</script>

<style scoped>
.services-page {
  background: #f8f9fa;
  min-height: 100vh;
}

/* Hero секция */
.page-hero {
  background: linear-gradient(135deg, #333 0%, #666 100%);
  color: white;
  padding: 4rem 0 3rem;
  position: relative;
  overflow: hidden;
}

.hero-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 300;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  line-height: 1.6;
}

/* Основные услуги */
.main-services {
  padding: 6rem 0;
  background: white;
}

.services-grid {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  max-width: 1000px;
  margin: 0 auto;
}

.service-card-large {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 3rem;
  padding: 3rem;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.service-card-large:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.service-image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  width: 200px;
  height: 200px;
  background: #f8f9fa;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
}

.service-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.service-title {
  font-size: 2rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.service-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #666;
  margin-bottom: 2rem;
}

.service-features {
  margin-bottom: 2rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: #666;
}

.feature-check {
  color: #00a86b;
  font-weight: 600;
}

.service-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-label {
  font-size: 0.9rem;
  color: #666;
}

.meta-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

/* Дополнительные услуги */
.additional-services {
  padding: 6rem 0;
  background: #f8f9fa;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 300;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #666;
}

.additional-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.additional-card {
  padding: 2.5rem 2rem;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 15px;
  text-align: center;
  transition: all 0.3s ease;
}

.additional-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.additional-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.additional-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.additional-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.additional-price {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
}

/* CTA секция */
.services-cta {
  padding: 6rem 0;
  background: white;
}

.cta-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 300;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.cta-description {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Кнопки */
.btn {
  padding: 1rem 2rem;
  border: 1px solid #1a1a1a;
  background: transparent;
  color: #1a1a1a;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.btn-primary {
  background: #1a1a1a;
  color: white;
}

.btn-dark {
  background: #1a1a1a;
  color: white;
}

.btn-outline {
  background: transparent;
  color: #1a1a1a;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Адаптивность */
@media (max-width: 768px) {
  .service-card-large {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem;
    text-align: center;
  }

  .image-placeholder {
    width: 150px;
    height: 150px;
    font-size: 3rem;
    margin: 0 auto;
  }

  .service-meta {
    justify-content: center;
  }

  .cta-actions {
    flex-direction: column;
    align-items: center;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .section-title {
    font-size: 2rem;
  }
}
</style>