// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'
import './login.css'
import router from './router'

const app = createApp(App)

app.use(router)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: { darkModeSelector: '.prime-dark' },
  },
})
document.documentElement.classList.remove('prime-dark', 'dark')
app.mount('#app')
