
<script setup>



import { ref } from 'vue'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import { auth } from '../firebaseConfig'

import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { getFirestore, doc, getDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')
const fieldErrors = ref({ email: '', password: '' })

const db = getFirestore()
const router = useRouter()


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
function validateEmail(blur = false) {
  const validator = String(email.value || '').trim()
  let errorMsg = ''
  if (!validator) {
    if (blur) errorMsg = 'Please enter your email address.'
  } else if (!emailRegex.test(validator)) {
    if (blur) errorMsg = 'Please enter a valid email address.'
  }
  fieldErrors.value.email = errorMsg
  return !errorMsg
}

function validatePassword(blur = false) {
  let msg = ''
  if (!password.value) {
    if (blur) msg = 'Password is required.'
  }
  fieldErrors.value.password = msg
  return !msg
}


async function handleLogin() {
  error.value = ''
  success.value = ''

  const emailOk = validateEmail(true)
  const passwordOk = validatePassword(true)
  if (!emailOk || !passwordOk) return

  try {
    loading.value = true
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user


    const userRef = doc(db, 'users', user.uid)
    const snap = await getDoc(userRef)
    if (!snap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || "",
        role: 'user',
        createdAt: new Date()
      })
    }


    const adminRef = doc(db, 'admins', user.uid)
    const adminSnap = await getDoc(adminRef)

    if (adminSnap.exists()) {
      const adminData = adminSnap.data()
      success.value = `Welcome back, Admin ${adminData.name || ''}!`
      localStorage.setItem('userRole', 'admin')
      setTimeout(() => router.push('/admin-homepage'), 1200)
      return
    }


    const userSnap = await getDoc(userRef)
    if (userSnap.exists()) {
      const userData = userSnap.data()
      success.value = `Welcome back, ${userData.displayName || userData.email}!`
      localStorage.setItem('userRole', userData.role || 'user')
      setTimeout(() => router.push('/homePage'), 1200)
      return
    }

    error.value = 'No profile found. Please sign up first.'
  } catch (e) {
    if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password') {
      error.value = 'Incorrect email or password.'
    } else if (e.code === 'auth/user-not-found') {
      error.value = 'No account found with this email.'
    } else {
      console.error(e)
      error.value = 'Something went wrong. Please try again.'
    }
  } finally {
    loading.value = false
  }
}



async function handleForgotPassword() {
  error.value = ''
  success.value = ''

  const emailOk = validateEmail(true)
  if (!emailOk) return

  try {

    let found = false
    for (const col of ['users', 'admins']) {
      const colRef = collection(db, col)
      const q = query(colRef, where('email', '==', email.value))
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        found = true
        break
      }
    }

    if (!found) {
      error.value = 'This email is not registered. Please sign up.'
      return
    }

    const actionCodeSettings = {
      url: 'http://localhost:5173/reset-password',
      handleCodeInApp: true
    }

    await sendPasswordResetEmail(auth, email.value, actionCodeSettings)
    success.value = 'Password reset link sent! Please check your inbox.'
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <main class="login-wrap" aria-label="Login">
    <form class="login-card" @submit.prevent="handleLogin" novalidate>
      <h1 class="app-title">Youthealth</h1>
      <h2 class="login-title">Login</h2>
      <p class="login-muted">Enter your credentials.</p>

      <div v-if="error" class="login-alert login-alert--outside" role="alert">{{ error }}</div>
      <div v-if="success" class="login-alert login-alert--outside success" role="status">{{ success }}</div>

      <label class="login-field">
        <span>Email</span>
        <input type="email" v-model="email" required
               :class="{'is-invalid': fieldErrors.email}"
               @input="validateEmail(false)" @blur="validateEmail(true)" />
        <p v-if="fieldErrors.email" class="login-alert error-tooltip">{{ fieldErrors.email }}</p>
      </label>

      <label class="login-field">
        <span>Password</span>
        <div class="input-group">
          <input :type="showPassword ? 'text' : 'password'" class="form-control"
                 v-model="password" required
                 :class="{'is-invalid': fieldErrors.password}"
                 @input="validatePassword(false)" @blur="validatePassword(true)" />
          <button type="button" class="btn btn-outline-secondary" @click="showPassword = !showPassword">
            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>
        <p v-if="fieldErrors.password" class="login-alert error-tooltip">{{ fieldErrors.password }}</p>
      </label>

      <Button type="submit" class="login-primary" :disabled="loading">
        <span v-if="loading">Logging in...</span>
        <span v-else>Login</span>
      </Button>

      <p class="login-links">
        <a href="#" @click.prevent="handleForgotPassword">Forgot password?</a> |
        <a href="/firesignup">Sign up now</a>
      </p>
    </form>
  </main>
</template>


