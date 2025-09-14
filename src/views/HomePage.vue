

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()


const isAdminPath = computed(() => route.path.includes('admin'))
</script>
<template>

  <main class="homepage">
    <h1>Welcome to HomePage</h1>
    <p>Coming soon...</p>


    <div v-if="!isAdminPath">
      <router-link to="/ratings">
        <button class="btn btn-success">Rate the App</button>
      </router-link>
    </div>


    <div v-if="isAdminPath">
      <router-link to="/admin-dashboard">
        <button class="btn btn-warning">Admin Dashboard</button>
      </router-link>
    </div>

    <div style="margin-top: 2rem;">
      <router-link to="/login">Logout</router-link>
    </div>


  </main>
</template>

