<template>
  <div class="about-page">
    <!-- Hero секция -->
    <section class="page-hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">О нашей компании</h1>
          <p class="hero-subtitle">
            15 лет профессионального сервиса и тысячи довольных клиентов
          </p>
        </div>
      </div>
    </section>

    <!-- О компании -->
    <section class="company-section">
      <div class="container">
        <div class="company-grid">
          <div class="company-content">
            <h2>Наша история</h2>
            <p>
              TECH SERVICE PRO был основан в 2009 году с целью предоставления
              качественных сервисных услуг в сфере ремонта электроники.
              За 15 лет работы мы выросли из небольшой мастерской в
              современный сервисный центр с командой профессионалов.
            </p>
            <p>
              Сегодня мы объединяем лучших специалистов, современное
              оборудование и многолетний опыт для решения самых сложных
              задач по ремонту техники.
            </p>

            <div class="stats-row">
              <div class="stat">
                <div class="stat-number">15+</div>
                <div class="stat-label">лет опыта</div>
              </div>
              <div class="stat">
                <div class="stat-number">50K+</div>
                <div class="stat-label">отремонтированных устройств</div>
              </div>
              <div class="stat">
                <div class="stat-number">99%</div>
                <div class="stat-label">довольных клиентов</div>
              </div>
            </div>
          </div>

          <div class="company-image">
            <div class="image-placeholder">
              <i class="pi pi-building" style="font-size: 8rem; color: #222;"></i>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Ценности -->
    <section class="values-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Наши ценности</h2>
          <p class="section-subtitle">Принципы, которые направляют нашу работу</p>
        </div>

        <div class="values-grid">
          <div v-for="value in values" :key="value.id" class="value-card">
            <div class="value-icon">
              <i :class="value.icon"></i>
            </div>
            <h3 class="value-title">{{ value.title }}</h3>
            <p class="value-description">{{ value.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Команда -->
    <section class="team-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Наша команда</h2>
          <p class="section-subtitle">Профессионалы с многолетним опытом</p>
        </div>

        <div class="team-grid">
          <div v-for="member in team" :key="member.id" class="team-card">
            <div class="member-photo">
              <div class="photo-placeholder">
                <i :class="member.icon"></i>
              </div>
            </div>
            <h3 class="member-name">{{ member.name }}</h3>
            <p class="member-role">{{ member.role }}</p>
            <p class="member-experience">{{ member.experience }}</p>
            <p class="member-specialization">{{ member.specialization }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Сертификаты -->
    <section class="certificates-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Сертификаты и лицензии</h2>
        </div>

        <div class="certificates-grid">
          <div v-for="cert in certificates" :key="cert.id" class="certificate-card">
            <div class="cert-icon">
              <i :class="cert.icon"></i>
            </div>
            <h3 class="cert-title">{{ cert.title }}</h3>
            <p class="cert-description">{{ cert.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'AboutPage',

  setup() {
    const values = ref([
      {
        id: 1,
        icon: 'pi pi-verified',
        title: 'Качество',
        description: 'Используем только оригинальные запчасти и современное оборудование'
      },
      {
        id: 2,
        icon: 'pi pi-bolt',
        title: 'Скорость',
        description: 'Большинство ремонтов выполняем в течение 1-2 рабочих дней'
      },
      {
        id: 3,
        icon: 'pi pi-shield',
        title: 'Надежность',
        description: 'Предоставляем гарантию до 2 лет на все виды работ'
      },
      {
        id: 4,
        icon: 'pi pi-graduation-cap',
        title: 'Профессионализм',
        description: 'Работают только сертифицированные специалисты с опытом от 5 лет'
      }
    ])

    const team = ref([
      {
        id: 1,
        icon: 'pi pi-user',
        name: 'Александр Петров',
        role: 'Технический директор',
        experience: 'Опыт: 12 лет',
        specialization: 'Специализация: ноутбуки, серверы'
      },
      {
        id: 2,
        icon: 'pi pi-user',
        name: 'Мария Иванова',
        role: 'Старший мастер',
        experience: 'Опыт: 8 лет',
        specialization: 'Специализация: Apple техника'
      },
      {
        id: 3,
        icon: 'pi pi-user',
        name: 'Дмитрий Сидоров',
        role: 'Инженер-электронщик',
        experience: 'Опыт: 10 лет',
        specialization: 'Специализация: чип-левел ремонт'
      },
      {
        id: 4,
        icon: 'pi pi-user',
        name: 'Елена Козлова',
        role: 'Специалист по данным',
        experience: 'Опыт: 6 лет',
        specialization: 'Специализация: восстановление данных'
      }
    ])

    const certificates = ref([
      {
        id: 1,
        icon: 'pi pi-apple',
        title: 'Сертификат Apple',
        description: 'Официальный сертификат авторизованного сервисного центра Apple'
      },
      {
        id: 2,
        icon: 'pi pi-mobile',
        title: 'Сертификат Samsung',
        description: 'Сертифицированный партнер Samsung по ремонту мобильных устройств'
      },
      {
        id: 3,
        icon: 'pi pi-star-fill',
        title: 'ISO 9001',
        description: 'Международный стандарт качества управления'
      },
      {
        id: 4,
        icon: 'pi pi-id-card',
        title: 'Лицензия СРО',
        description: 'Лицензия на осуществление сервисной деятельности'
      }
    ])

    return {
      values,
      team,
      certificates
    }
  }
}
</script>

<style scoped>
.about-page {
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

/* О компании */
.company-section {
  padding: 6rem 0;
  background: white;
}

.company-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 4rem;
  align-items: center;
  max-width: 1000px;
  margin: 0 auto;
}

.company-content h2 {
  font-size: 2.5rem;
  font-weight: 300;
  color: #1a1a1a;
  margin-bottom: 2rem;
}

.company-content p {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #666;
  margin-bottom: 1.5rem;
}

.stats-row {
  display: flex;
  gap: 3rem;
  margin-top: 3rem;
}

.stat {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.company-image {
  display: flex;
  justify-content: center;
}

.image-placeholder {
  width: 300px;
  height: 300px;
  background: #f8f9fa;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6rem;
}

/* Ценности */
.values-section {
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

.values-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.value-card {
  padding: 2.5rem 2rem;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 15px;
  text-align: center;
  transition: all 0.3s ease;
}

.value-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.value-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.value-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.value-description {
  color: #666;
  line-height: 1.6;
}

/* Команда */
.team-section {
  padding: 6rem 0;
  background: white;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.team-card {
  padding: 2.5rem 2rem;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 15px;
  text-align: center;
  transition: all 0.3s ease;
}

.team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.member-photo {
  margin-bottom: 1.5rem;
}

.photo-placeholder {
  width: 120px;
  height: 120px;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin: 0 auto;
}

.member-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.member-role {
  font-size: 1rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.member-experience {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.member-specialization {
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}

/* Сертификаты */
.certificates-section {
  padding: 6rem 0;
  background: #f8f9fa;
}

.certificates-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.certificate-card {
  padding: 2.5rem 2rem;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 15px;
  text-align: center;
  transition: all 0.3s ease;
}

.certificate-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.cert-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.cert-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.cert-description {
  color: #666;
  line-height: 1.6;
}

/* Адаптивность */
@media (max-width: 768px) {
  .company-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }

  .stats-row {
    flex-direction: column;
    gap: 2rem;
  }

  .image-placeholder {
    width: 200px;
    height: 200px;
    font-size: 4rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .section-title {
    font-size: 2rem;
  }
}
</style>