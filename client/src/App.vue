<template>
  <div class="app">
    <Header />
    <router-view />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';

export default {
  name: 'App',
  components: { Header }
};
</script>

<style src="./assets/main.css"></style>