<template>
  <div id="app">
    <Header v-if="$route.name !== 'Auth'" />
    <router-view />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import 'primeicons/primeicons.css'

export default {
  name: 'App',
  components: { Header }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  background: var(--background-color);
  color: var(--text-color);
  font-family: Arial, sans-serif;
  font-size: var(--font-size);
}
</style>