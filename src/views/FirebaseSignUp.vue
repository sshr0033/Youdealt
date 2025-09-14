<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import { useRouter } from 'vue-router'
import { auth } from '../main'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const name = ref('')
const birthday = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref(null)
const roles = [
  { label: 'Doctor', value: 'user: doctor' },
  { label: 'Youth', value: 'user: youth' }
]

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')

const fieldErrors = ref({
  name: '',
  birthday: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: ''
})

const db = getFirestore()
const router = useRouter()

function validateName(blur = false) {
  let msg = ''
  if (!name.value.trim()) {
    if (blur) msg = 'Name is required.'
  } else if (name.value.trim().length < 2) {
    if (blur) msg = 'Name must be at least 2 characters.'
  }
  fieldErrors.value.name = msg
  return !msg
}

function validateBirthday(blur = false) {
  let msg = ''
  if (!birthday.value) {
    if (blur) msg = 'Birthday is required.'
  } else {
    const birthDate = new Date(birthday.value)
    const today = new Date()
    const minAgeDate = new Date()
    minAgeDate.setFullYear(today.getFullYear() - 3)

    if (birthDate > today) {
      msg = 'Birthday cannot be in the future.'
    } else if (birthDate > minAgeDate) {
      msg = 'You must be at least 3 years old.'
    }
  }
  fieldErrors.value.birthday = msg
  return !msg
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
function validateEmail(blur = false) {
  const validator = String(email.value || '').trim()
  let msg = ''
  if (!validator) {
    if (blur) msg = 'Please enter your email address.'
  } else if (!emailRegex.test(validator)) {
    if (blur) msg = 'Please enter a valid email address.'
  }
  fieldErrors.value.email = msg
  return !msg
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

function validateConfirmPassword(blur = false) {
  let msg = ''
  if (!confirmPassword.value) {
    if (blur) msg = 'Please confirm your password.'
  } else if (confirmPassword.value !== password.value) {
    if (blur) msg = 'Passwords do not match.'
  }
  fieldErrors.value.confirmPassword = msg
  return !msg
}

function validateRole(blur = false) {
  let msg = ''
  if (!role.value) {
    if (blur) msg = 'Role is required.'
  }
  fieldErrors.value.role = msg
  return !msg
}

async function handleSignup() {
  error.value = ''
  success.value = ''

  const nameOk = validateName(true)
  const birthdayOk = validateBirthday(true)
  const emailOk = validateEmail(true)
  const passwordOk = validatePassword(true)
  const confirmOk = validateConfirmPassword(true)
  const roleOk = validateRole(true)

  if (!nameOk || !birthdayOk || !emailOk || !passwordOk || !confirmOk || !roleOk) return

  try {
    loading.value = true
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user

    await setDoc(doc(db, 'users', user.uid), {
      name: name.value.trim(),
      birthday: birthday.value,
      email: user.email,
      role: role.value,
      createdAt: new Date().toISOString(),
    })

    success.value = ' Signup successful! Redirecting to login...'
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (e) {
    switch (e.code) {
      case 'auth/email-already-in-use':
        error.value = 'This email is already in use. Please use a different email.'
        break
      case 'auth/invalid-email':
        error.value = 'The email address is not valid.'
        break
      case 'auth/operation-not-allowed':
        error.value = 'Email/password accounts are not enabled.'
        break
      case 'auth/weak-password':
        error.value = 'The password is too weak. Please choose a stronger password.'
        break
      default:
        error.value = 'An error occurred during signup. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-wrap" aria-label="User Signup">
    <form class="login-card" @submit.prevent="handleSignup" novalidate>
      <h1 class="app-title">Youthealth</h1>
      <h2 class="login-title">Create Account</h2>
      <p class="login-muted">Sign up as Doctor or Youth.</p>

      <div v-if="error" class="login-alert login-alert--outside">{{ error }}</div>
      <div v-if="success" class="login-alert login-alert--outside success">{{ success }}</div>

      <label class="login-field">
        <span>Name</span>
        <input type="text" v-model="name" :class="{'is-invalid': fieldErrors.name}"
          @input="validateName(false)" @blur="validateName(true)" />
        <p v-if="fieldErrors.name" class="login-alert error-tooltip">{{ fieldErrors.name }}</p>
      </label>

      <label class="login-field">
        <span>Birthday</span>
        <input type="date" v-model="birthday" :class="{'is-invalid': fieldErrors.birthday}"
          @blur="validateBirthday(true)" />
        <p v-if="fieldErrors.birthday" class="login-alert error-tooltip">{{ fieldErrors.birthday }}</p>
      </label>

      <label class="login-field">
        <span>Email</span>
        <input type="email" v-model="email" :class="{'is-invalid': fieldErrors.email}"
          @input="validateEmail(false)" @blur="validateEmail(true)" />
        <p v-if="fieldErrors.email" class="login-alert error-tooltip">{{ fieldErrors.email }}</p>
      </label>

      <label class="login-field">
        <span>Password</span>
        <div class="input-group">
          <input :type="showPassword ? 'text' : 'password'" class="form-control"
            :class="{'is-invalid': fieldErrors.password}" v-model="password"
            @input="validatePassword(false)" @blur="validatePassword(true)" />
          <button type="button" class="btn btn-outline-secondary" @click="showPassword = !showPassword">
            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>
        <p v-if="fieldErrors.password" class="login-alert error-tooltip">{{ fieldErrors.password }}</p>
      </label>

      <label class="login-field">
        <span>Confirm Password</span>
        <div class="input-group">
          <input :type="showConfirmPassword ? 'text' : 'password'" class="form-control"
            :class="{'is-invalid': fieldErrors.confirmPassword}" v-model="confirmPassword"
            @input="validateConfirmPassword(false)" @blur="validateConfirmPassword(true)" />
          <button type="button" class="btn btn-outline-secondary"
            @click="showConfirmPassword = !showConfirmPassword">
            <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>
        <p v-if="fieldErrors.confirmPassword" class="login-alert error-tooltip">{{ fieldErrors.confirmPassword }}</p>
      </label>

      <label class="login-field">
        <span>Role</span>
        <Dropdown v-model="role" :options="roles" optionLabel="label"
          :class="{'is-invalid': fieldErrors.role}" optionValue="value"
          placeholder="Select a role" @blur="validateRole(true)" />
        <p v-if="fieldErrors.role" class="login-alert error-tooltip">{{ fieldErrors.role }}</p>
      </label>

      <Button type="submit" class="login-primary" :disabled="loading">
        <span v-if="loading">Signing up...</span><span v-else>Sign Up</span>
      </Button>
    </form>
  </main>
</template>


<style scoped>

.readonly-role {
  background: #f3f3f3;
  border: 1px solid #ddd;
  padding: 0.5rem;
  width: 100%;
  border-radius: 6px;
}

</style>
