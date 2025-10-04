import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Импорт роутера
import { createPinia } from 'pinia';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import Vue3AnimateOnScroll from 'vue3-animate-onscroll';
import './assets/main.css'; // Глобальные стили

const app = createApp(App);

app.use(router);
app.use(createPinia());
app.use(Toast);
app.use(Vue3AnimateOnScroll);

app.mount('#app');