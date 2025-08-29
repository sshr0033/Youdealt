<script setup>
import { ref } from 'vue'
import '../login.css'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

function isValidEmail(v) {
  return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(v)
}

async function handleLogin() {
  error.value = ''
  if (!email.value || !isValidEmail(email.value)) {
    error.value = 'Please enter a valid email address.'
    return
  }
  if (!password.value) {
    error.value = 'Please enter your password.'
    return
  }
}
</script>

<template>
  <main class="login-wrap" role="main" aria-label="Login">
    <form class="login-card" @submit="handleLogin" novalidate>
      <h1 class="login-title">Welcome back to Youthealth</h1>
      <p class="login-muted">Sign in to continue.</p>

      <div v-if="error" class="login-alert" role="alert">{{ error }}</div>

      <label class="login-field">
        <span>Email</span>
        <input
          type="email"
          inputmode="email"
          autocomplete="email"
          placeholder="shreya@example.com"
          v-model="email"
          required
        />
      </label>

      <label class="login-field">
        <span>Password</span>
        <div class="login-password">
          <input
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            v-model="password"
            required
          />
          <button
            type="button"
            class="login-ghost"
            :aria-pressed="showPassword.toString()"
            @click="showPassword = !showPassword"
          >
            <span v-if="showPassword">Hide</span>
            <span v-else>Show</span>
          </button>
        </div>
      </label>

      <button class="login-btn" type="submit" :disabled="loading">
        <span v-if="!loading">Log in</span>
        <span v-else class="login-spinner" aria-live="polite">Signing in…</span>
      </button>
    </form>
  </main>
</template>
