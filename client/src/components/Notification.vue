<template>
    <div class="notification">
      <h3>Уведомления</h3>
      <ul>
        <li v-for="notification in notifications" :key="notification.id">
          {{ notification.message }} ({{ formatDate(notification.date) }})
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Notification',
    props: {
      notifications: {
        type: Array,
        default: () => []
      }
    },
    methods: {
      formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('ru-RU');
      }
    }
  };
  </script>
  
  <style scoped>
  .notification {
    padding: 16px;
    border: 1px solid #eaeaea;
    border-radius: 8px;
  }
  
  h3 {
    font-size: 18px;
    margin-bottom: 12px;
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  li {
    padding: 8px 0;
    font-size: var(--font-size, 16px);
  }
  </style>