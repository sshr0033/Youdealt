<template>

  <div v-if="!isOnline" class="offline-banner">
    You are offline. Some features may not work.
  </div>

  <main class="app-shell">
    <RouterView />
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const isOnline = ref(navigator.onLine);

function updateOnlineStatus() {
  isOnline.value = navigator.onLine;
}

onMounted(() => {
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
});

onBeforeUnmount(() => {
  window.removeEventListener("online", updateOnlineStatus);
  window.removeEventListener("offline", updateOnlineStatus);
});
</script>

<style scoped>
.offline-banner {
  background: #ff5252;
  color: white;
  text-align: center;
  padding: 0.6rem;
  font-weight: 600;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10000;
}

.app-shell {
  min-height: 100vh;
  background: var(--bg, #f7f8fc);
  display: flex;
  flex-direction: column;
}
</style>
