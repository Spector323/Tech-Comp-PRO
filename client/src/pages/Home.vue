<template>
  <div class="home-page">
    <!-- Hero секция -->
    <section class="hero">
      <div class="hero-background">
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
          <div class="shape shape-4"></div>
          <div class="shape shape-5"></div>
          <div class="shape shape-6"></div>
          <div class="shape shape-7"></div>
        </div>
      </div>

      <div class="hero-content">
        <div class="hero-text">
          <div class="pre-title">TECH SERVICE PRO</div>
          <h1 class="hero-title">
            Ремонт техники
            <span class="title-highlight">премиум-класса</span>
          </h1>
          <p class="hero-subtitle">
            Профессиональный сервис с 15-летней историей.
            Используем только оригинальные комплектующие и современное оборудование
          </p>

          <div class="hero-actions">
            <button @click="scrollToServices" class="btn btn-primary">
              <span>Наши услуги</span>
              <div class="btn-arrow">→</div>
            </button>

            <button v-if="!isAuthenticated" @click="$router.push('/auth')" class="btn btn-secondary">
              <span>Личный кабинет</span>
            </button>
          </div>
        </div>

        <div class="hero-visual">
          <div class="device-showcase">
            <div class="device device-1" :class="{ 'animate': isVisible }">
              <div class="device-screen"></div>
            </div>
            <div class="device device-2" :class="{ 'animate': isVisible }">
              <div class="device-screen"></div>
            </div>
            <div class="device device-3" :class="{ 'animate': isVisible }">
              <div class="device-screen"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="scroll-hint">
        <div class="scroll-line"></div>
        <span>Листайте вниз</span>
      </div>
    </section>

    <!-- Преимущества -->
    <section class="benefits-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Почему выбирают нас</h2>
          <p class="section-subtitle">15 лет безупречной работы и тысячи довольных клиентов</p>
        </div>

        <div class="benefits-grid">
          <div v-for="benefit in benefits" :key="benefit.id" class="benefit-card">
            <div class="benefit-icon">
              <div class="icon-wrapper">
                {{ benefit.icon }}
              </div>
            </div>
            <h3 class="benefit-title">{{ benefit.title }}</h3>
            <p class="benefit-description">{{ benefit.description }}</p>
            <div class="benefit-number">0{{ benefit.id }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Услуги -->
    <section id="services" class="services-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Наши услуги</h2>
          <p class="section-subtitle">Полный спектр услуг по ремонту и обслуживанию техники</p>
        </div>

        <div class="services-grid">
          <div v-for="service in services" :key="service.id" class="service-card">
            <div class="service-header">
              <div class="service-icon">{{ service.icon }}</div>
              <h3 class="service-title">{{ service.title }}</h3>
            </div>
            <p class="service-description">{{ service.description }}</p>
            <div class="service-features">
              <div v-for="feature in service.features" :key="feature" class="feature">
                <span class="feature-dot"></span>
                {{ feature }}
              </div>
            </div>
            <div class="service-footer">
              <span class="service-time">{{ service.time }}</span>
              <span class="service-warranty">{{ service.warranty }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Процесс работы -->
    <section class="process-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Как мы работаем</h2>
          <p class="section-subtitle">Прозрачный процесс от приема до выдачи устройства</p>
        </div>

        <div class="process-timeline">
          <div v-for="step in processSteps" :key="step.id" class="process-step">
            <div class="step-number">{{ step.number }}</div>
            <div class="step-content">
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-description">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Бренды -->
    <section class="brands-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Работаем с ведущими брендами</h2>
        </div>

        <div class="brands-grid">
          <div v-for="brand in brands" :key="brand.id" class="brand-logo">
            <div class="logo-placeholder">{{ brand.name }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA секция -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-card">
          <div class="cta-content">
            <h2 class="cta-title">Готовы начать?</h2>
            <p class="cta-description">
              Оставьте заявку и наш менеджер свяжется с вами в течение 15 минут
            </p>

            <div class="cta-actions">
              <button v-if="!isAuthenticated" @click="$router.push('/auth')" class="btn btn-dark">
                <span>Создать заявку</span>
              </button>

              <button v-else @click="$router.push('/orders')" class="btn btn-dark">
                <span>Мои заявки</span>
              </button>

              <button class="btn btn-outline">
                <span>+7 (999) 999-99-99</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'HomePage',

  setup() {
    const authStore = useAuthStore()
    const isVisible = ref(false)

    const isAuthenticated = computed(() => authStore.isAuthenticated)

    const scrollToServices = () => {
      document.getElementById('services').scrollIntoView({
        behavior: 'smooth'
      })
    }

    onMounted(() => {
      isVisible.value = true
    })

    // Преимущества
    const benefits = [
      {
        id: 1,
        icon: '🏆',
        title: '15 лет опыта',
        description: 'Более 15 лет успешной работы на рынке сервисных услуг'
      },
      {
        id: 2,
        icon: '🔧',
        title: 'Оригинальные запчасти',
        description: 'Используем только сертифицированные комплектующие'
      },
      {
        id: 3,
        icon: '⏱️',
        title: 'Срочный ремонт',
        description: 'Большинство ремонтов выполняем в течение 1-2 дней'
      },
      {
        id: 4,
        icon: '🛡️',
        title: 'Гарантия 2 года',
        description: 'Даем расширенную гарантию на все виды работ'
      }
    ]

    // Услуги
    const services = [
      {
        id: 1,
        icon: '💻',
        title: 'Ремонт ноутбуков',
        description: 'Диагностика и ремонт ноутбуков любых производителей',
        features: ['Замена матриц', 'Ремонт материнских плат', 'Чистка систем охлаждения', 'Апгрейд комплектующих'],
        time: '1-3 дня',
        warranty: '2 года'
      },
      {
        id: 2,
        icon: '🖥️',
        title: 'Ремонт компьютеров',
        description: 'Обслуживание и ремонт стационарных ПК и мониторов',
        features: ['Сборка компьютеров', 'Замена комплектующих', 'Чистка от пыли', 'Установка ОС'],
        time: '1-2 дня',
        warranty: '2 года'
      },
      {
        id: 4,
        icon: '🎮',
        title: 'Игровое оборудование',
        description: 'Ремонт игровых консолей и специализированной техники',
        features: ['Ремонт консолей', 'Обслуживание геймпадов', 'Апгрейд игровых ПК', 'Настройка периферии'],
        time: '2-4 дня',
        warranty: '1 год'
      }
    ]

    // Процесс работы
    const processSteps = [
      {
        id: 1,
        number: '01',
        title: 'Диагностика',
        description: 'Бесплатная диагностика и составление сметы ремонта'
      },
      {
        id: 2,
        number: '02',
        title: 'Согласование',
        description: 'Согласование стоимости и сроков с клиентом'
      },
      {
        id: 3,
        number: '03',
        title: 'Ремонт',
        description: 'Профессиональный ремонт с использованием оригинальных запчастей'
      },
      {
        id: 4,
        number: '04',
        title: 'Тестирование',
        description: 'Тщательное тестирование устройства перед выдачей'
      },
      {
        id: 5,
        number: '05',
        title: 'Выдача',
        description: 'Выдача устройства с гарантией и полным отчетом о работе'
      }
    ]

    // Бренды
    const brands = [
      { id: 1, name: 'APPLE' },
      { id: 2, name: 'SAMSUNG' },
      { id: 3, name: 'ASUS' },
      { id: 4, name: 'LENOVO' },
      { id: 5, name: 'DELL' },
      { id: 6, name: 'HP' },
      { id: 7, name: 'SONY' },
      { id: 8, name: 'ACER' }
    ]

    return {
      isAuthenticated,
      isVisible,
      scrollToServices,
      benefits,
      services,
      processSteps,
      brands
    }
  }
}
</script>

<style scoped>
.home-page {
  overflow-x: hidden;
}

/* Hero секция */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f1f3f4 100%);
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  animation: float 20s ease-in-out infinite;
}

.shape-1 {
  width: 100px;
  height: 100px;
  top: 10%;
  left: 5%;
  animation-delay: 0s;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  left: 80%;
  animation-delay: 5s;
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
}

.shape-3 {
  width: 80px;
  height: 80px;
  top: 80%;
  left: 20%;
  animation-delay: 10s;
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
}

.shape-4 {
  width: 120px;
  height: 120px;
  top: 20%;
  left: 70%;
  animation-delay: 15s;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
}

.shape-5 {
  width: 93px;
  height: 100px;
  top: 36%;
  left: 90%;
  animation-delay: 15s;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
}

.shape-6 {
  width: 130px;
  height: 120px;
  top: 56%;
  left: 1%;
  animation-delay: 10s;
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
}


@keyframes float {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }

  33% {
    transform: translateY(-20px) rotate(120deg);
  }

  66% {
    transform: translateY(10px) rotate(240deg);
  }
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 2;
}

.hero-text {
  max-width: 500px;
}

.pre-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 300;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
}

.title-highlight {
  font-weight: 600;
  color: #1a1a1a;
  position: relative;
}

.title-highlight::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #1a1a1a;
  transform: scaleX(0);
  animation: underline 2s ease-in-out 1s forwards;
}

@keyframes underline {
  to {
    transform: scaleX(1);
  }
}

.hero-subtitle {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #666;
  margin-bottom: 3rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: 1px solid #1a1a1a;
  background: transparent;
  color: #1a1a1a;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: #1a1a1a;
  color: white;
}

.btn-secondary {
  background: transparent;
  color: #1a1a1a;
}

.btn-dark {
  background: #1a1a1a;
  color: white;
  border-color: #1a1a1a;
}

.btn-outline {
  background: transparent;
  color: #1a1a1a;
  border-color: #1a1a1a;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.btn-arrow {
  transition: transform 0.3s ease;
}

.btn:hover .btn-arrow {
  transform: translateX(3px);
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.device-showcase {
  position: relative;
  width: 400px;
  height: 300px;
}

.device {
  position: absolute;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.5s ease;
  opacity: 0;
  transform: translateY(30px);
}

.device.animate {
  opacity: 1;
  transform: translateY(0);
}

.device-1 {
  width: 200px;
  height: 120px;
  top: 0;
  left: 0;
  transition-delay: 0.2s;
}

.device-2 {
  width: 180px;
  height: 250px;
  top: 50px;
  right: 0;
  transition-delay: 0.4s;
}

.device-3 {
  width: 150px;
  height: 90px;
  bottom: 0;
  left: 100px;
  transition-delay: 0.6s;
}

.device-screen {
  width: 90%;
  height: 70%;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 6px;
  margin: 15% auto;
  position: relative;
  overflow: hidden;
}

.device-screen::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

.scroll-hint {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.scroll-line {
  width: 1px;
  height: 40px;
  background: #1a1a1a;
  animation: scrollLine 2s infinite;
}

@keyframes scrollLine {

  0%,
  100% {
    transform: scaleY(1);
    opacity: 1;
  }

  50% {
    transform: scaleY(0.5);
    opacity: 0.5;
  }
}

/* Общие стили секций */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
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
  max-width: 600px;
  margin: 0 auto;
}

/* Преимущества */
.benefits-section {
  padding: 6rem 0;
  background: white;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.benefit-card {
  padding: 2.5rem 2rem;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
}

.benefit-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: #1a1a1a;
}

.benefit-icon {
  margin-bottom: 1.5rem;
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.benefit-card:hover .icon-wrapper {
  background: #1a1a1a;
  color: white;
}

.benefit-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.benefit-description {
  color: #666;
  line-height: 1.6;
}

.benefit-number {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 3rem;
  font-weight: 900;
  color: #f8f9fa;
  line-height: 1;
  z-index: 0;
}

/* Услуги */
.services-section {
  padding: 6rem 0;
  background: #f8f9fa;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.service-card {
  padding: 2.5rem 2rem;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: #1a1a1a;
}

.service-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.service-icon {
  font-size: 2.5rem;
}

.service-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.service-description {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.service-features {
  margin-bottom: 2rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: #666;
}

.feature-dot {
  width: 6px;
  height: 6px;
  background: #1a1a1a;
  border-radius: 50%;
  flex-shrink: 0;
}

.service-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid #f0f0f0;
}

.service-time,
.service-warranty {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

/* Процесс работы */
.process-section {
  padding: 6rem 0;
  background: white;
}

.process-timeline {
  max-width: 800px;
  margin: 0 auto;
}

.process-step {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  padding: 2rem 0;
  position: relative;
}

.process-step:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 1.5rem;
  top: 5rem;
  bottom: -2rem;
  width: 1px;
  background: #e0e0e0;
}

.step-number {
  width: 3rem;
  height: 3rem;
  background: #1a1a1a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.step-description {
  color: #666;
  line-height: 1.6;
}

/* Бренды */
.brands-section {
  padding: 4rem 0;
  background: #f8f9fa;
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.brand-logo:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.logo-placeholder {
  font-weight: 600;
  color: #666;
  font-size: 1.1rem;
}

/* CTA секция */
.cta-section {
  padding: 6rem 0;
  background: white;
}

.cta-card {
  max-width: 600px;
  margin: 0 auto;
  padding: 4rem;
  background: #1a1a1a;
  color: white;
  border-radius: 20px;
  text-align: center;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 300;
  margin-bottom: 1rem;
}

.cta-description {
  font-size: 1.2rem;
  margin-bottom: 3rem;
  opacity: 0.9;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Адаптивность */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 3rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .device-showcase {
    width: 300px;
    height: 200px;
  }

  .process-step {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .process-step:not(:last-child)::after {
    left: 50%;
    top: 4rem;
    bottom: -1rem;
    transform: translateX(-50%);
  }

  .cta-card {
    padding: 3rem 2rem;
  }

  .cta-actions {
    flex-direction: column;
  }
}
</style>