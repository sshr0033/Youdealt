import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'
import './login.css'
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getAuth } from 'firebase/auth'
import { getFirestore } from "firebase/firestore"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"

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


const firebaseConfig = {
  apiKey: "AIzaSyAMaQDK5A6P1fNenYjvID3Yy8lAqCulrrM",
  authDomain: "youthealth.firebaseapp.com",
  projectId: "youthealth",
  storageBucket: "youthealth.firebasestorage.app",
  messagingSenderId: "454261597136",
  appId: "1:454261597136:web:5305da23c45823ebbb0fd5",
  measurementId: "G-GKKSX0QF4M"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
getAnalytics(firebaseApp);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
app.mount('#app')
