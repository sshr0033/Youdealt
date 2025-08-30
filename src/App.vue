<!-- <script setup>
import BHeader from './components/BHeader.vue'
</script> -->

<template>
  <div class="app-shell">
    <!-- <BHeader /> -->
    <main class="page-wrap">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100svh;
  display: grid;
  place-items: center;
  background: var(--bg);
  align-content: center;
  color: var(--ink);
}

.page-wrap {
  display: grid;
  place-items: center;
  padding: 1rem;
}

header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
