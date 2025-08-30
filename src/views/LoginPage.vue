<script setup>
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const fieldErrors = ref({ email: '', password: '' })

const submissions = ref([])

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
function validateEmail(blur = false) {
  const validator = String(email.value || '').trim()
  let errorMsg = ''
  if (!validator) {
    if (blur) errorMsg = 'Please enter your email address.'
  } else if (!emailRegex.test(validator)) {
    if (blur) errorMsg = 'Please enter a valid email address'
  }
  fieldErrors.value.email = errorMsg
  return !errorMsg
}

function validatePassword(blur = false) {
  const pwd = password.value || ''
  const minLength = 8
  const hasUppercase = /[A-Z]/.test(pwd)
  const hasLowercase = /[a-z]/.test(pwd)
  const hasNumber = /\d/.test(pwd)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd)

  let msg = ''
  if (pwd.length < minLength) {
    if (blur) msg = `Password must be at least ${minLength} characters long.`
  } else if (!hasUppercase) {
    if (blur) msg = 'Password must contain at least one uppercase letter.'
  } else if (!hasLowercase) {
    if (blur) msg = 'Password must contain at least one lowercase letter.'
  } else if (!hasNumber) {
    if (blur) msg = 'Password must contain at least one number.'
  } else if (!hasSpecialChar) {
    if (blur) msg = 'Password must contain at least one special character.'
  }

  fieldErrors.value.password = msg
  return !msg
}

async function handleLogin() {
  error.value = ''
  const emailOk = validateEmail(true)
  const passwordCheck = validatePassword(true)

  if (!emailOk) {
    return
  }
  if (!password.value || !passwordCheck) {
    return
  }

  try {
    loading.value = true
    const row = {
      email: String(email.value).trim(),
      password: String(password.value),
    }
    submissions.value.unshift(row)
  } finally {
    loading.value = false
  }
}

function indexOfRow(row) {
  return submissions.value.indexOf(row)
}
function removeRow(row) {
  const i = indexOfRow(row)
  if (i > -1) submissions.value.splice(i, 1)
}
</script>

<template>
  <main class="login-wrap" aria-label="Login">
    <form class="login-card" @submit.prevent="handleLogin" novalidate>
      <h1 class="app-title">Youthealth</h1>
      <h2 class="login-title">Welcome back</h2>
      <p class="login-muted">Sign in to continue.</p>

      <label class="login-field">
        <span>Email</span>
        <input
          type="email"
          inputmode="email"
          autocomplete="email"
          v-model="email"
          required
          @input="validateEmail(false)"
          @blur="validateEmail(true)"
          :aria-invalid="Boolean(fieldErrors.email)"
        />
        <p v-if="fieldErrors.email" class="login-alert error-tooltip">
          {{ fieldErrors.email }}
        </p>
      </label>

      <label class="login-field">
        <span>Password</span>
        <div class="login-password">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            padding-right="4rem"
            required
            @input="validatePassword(false)"
            @blur="validatePassword(true)"
            :aria-invalid="Boolean(fieldErrors.password)"
          />

          <Button
            type="button"
            class="login-ghost"
            :aria-pressed="showPassword.toString()"
            @click="showPassword = !showPassword"
          >
            <span v-if="showPassword">Hide</span>
            <span v-else>Show</span>
          </Button>
        </div>
        <p v-if="fieldErrors.password" class="login-alert error-tooltip">
          {{ fieldErrors.password }}
        </p>
      </label>

      <button class="login-btn" type="submit" :disabled="loading">
        <span v-if="!loading">Log in</span>
        <span v-else class="login-spinner" aria-live="polite">Signing in…</span>
      </button>
    </form>

    <div v-if="error" class="login-alert login-alert--outside" role="alert" aria-live="polite">
      {{ error }}
    </div>

    <section class="login-card" style="margin-top: 1rem">
      <h2 class="login-title" style="margin-bottom: 0.5rem">Database For Logins</h2>

      <DataTable
        :value="submissions"
        :paginator="submissions.length > 5"
        :rows="5"
        stripedRows
        size="small"
        emptyMessage="No entries yet."
      >
        <Column field="email" header="Email" />
        <Column header="Password">
          <template #body="{ data }">
            {{ data.password }}
          </template>
        </Column>
        <Column header="Actions" style="width: 1%; white-space: nowrap">
          <template #body="{ data }">
            <Button
              size="small"
              severity="danger"
              text
              aria-label="Remove row"
              @click="removeRow(data)"
              >Remove</Button
            >
          </template>
        </Column>
      </DataTable>
    </section>
  </main>
</template>

<style scoped>
:deep(.p-datatable) {
  width: 100%;
}
</style>
