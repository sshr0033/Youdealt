<script setup>
import { ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { auth } from '../firebaseConfig'

import Button from 'primevue/button'
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth"

const route = useRoute()
const router = useRouter()

const newPassword = ref("")
const confirmPassword = ref("")
const error = ref("")
const success = ref("")
const loading = ref(false)

const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const fieldErrors = ref({
  newPassword: "",
  confirmPassword: ""
})

function validateNewPassword(blur = false) {
  const pwd = newPassword.value || ""
  const minLength = 8
  const hasUppercase = /[A-Z]/.test(pwd)
  const hasLowercase = /[a-z]/.test(pwd)
  const hasNumber = /\d/.test(pwd)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd)

  let msg = ""
  if (pwd.length < minLength) {
    if (blur) msg = `Password must be at least ${minLength} characters long.`
  } else if (!hasUppercase) {
    if (blur) msg = "Password must contain at least one uppercase letter."
  } else if (!hasLowercase) {
    if (blur) msg = "Password must contain at least one lowercase letter."
  } else if (!hasNumber) {
    if (blur) msg = "Password must contain at least one number."
  } else if (!hasSpecialChar) {
    if (blur) msg = "Password must contain at least one special character."
  }

  fieldErrors.value.newPassword = msg
  return !msg
}

function validateConfirmPassword(blur = false) {
  let msg = ""
  if (!confirmPassword.value) {
    if (blur) msg = "Please confirm your password."
  } else if (confirmPassword.value !== newPassword.value) {
    if (blur) msg = "Passwords do not match."
  }
  fieldErrors.value.confirmPassword = msg
  return !msg
}

async function handleResetPassword() {
  error.value = ""
  success.value = ""


  const pwdOk = validateNewPassword(true)
  const confirmOk = validateConfirmPassword(true)
  if (!pwdOk || !confirmOk) return

  try {
    loading.value = true
    const oobCode = route.query.oobCode

    await verifyPasswordResetCode(auth, oobCode)
    await confirmPasswordReset(auth, oobCode, newPassword.value)

    success.value = "Password reset successful. Redirecting to login..."
    setTimeout(() => router.push("/login"), 1500)
  } catch (e) {
    switch (e.code) {
      case "auth/expired-action-code":
        error.value = "The password reset link has expired. Please request a new one."
        break
      case "auth/internal-error":
        error.value = "The password reset link is invalid. Please request a new one."
        break
      case "auth/user-disabled":
        error.value = "This user account has been disabled."
        break
      case "auth/user-not-found":
        error.value = "No user found with this email."
        break
      case "auth/weak-password":
        error.value = "The new password is too weak. Please choose a stronger password."
        break
      default:
        error.value = "An error occurred while resetting the password. Please try again."
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-wrap" aria-label="Reset Password">
    <form class="login-card" @submit.prevent="handleResetPassword">
      <h1 class="app-title">Youthealth</h1>
      <h2 class="login-title">Reset Password</h2>


      <div class="mb-3">
        <label class="form-label">New Password</label>
        <div class="input-group">
          <input
            :type="showNewPassword ? 'text' : 'password'"
            class="form-control"
            v-model="newPassword"
            @input="validateNewPassword(false)"
            @blur="validateNewPassword(true)"
            :class="{'is-invalid': fieldErrors.newPassword}"
          />
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="showNewPassword = !showNewPassword"
          >
            <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>
        <p v-if="fieldErrors.newPassword" class="error-tooltip">{{ fieldErrors.newPassword }}</p>
      </div>


      <div class="mb-3">
        <label class="form-label">Confirm Password</label>
        <div class="input-group">
          <input
            :type="showConfirmPassword ? 'text' : 'password'"
            class="form-control"
            v-model="confirmPassword"
            @input="validateConfirmPassword(false)"
            @blur="validateConfirmPassword(true)"
            :class="{'is-invalid': fieldErrors.confirmPassword}"
          />
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>
        <p v-if="fieldErrors.confirmPassword" class="error-tooltip">{{ fieldErrors.confirmPassword }}</p>
      </div>

      <Button type="submit" class="login-primary w-100" :disabled="loading">
        <span v-if="loading">Resetting...</span>
        <span v-else>Reset Password</span>
      </Button>
    </form>

    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    <div v-if="success" class="alert alert-success mt-3">{{ success }}</div>
  </main>
</template>

<style scoped>
.is-invalid {
  background-color: #ffe6e6 !important;
  border: 1px solid #ff4d4d !important;
}

.error-tooltip {
  color: #ff1a1a;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}
</style>
