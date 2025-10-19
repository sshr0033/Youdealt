import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'
import './login.css'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import 'mapbox-gl/dist/mapbox-gl.css'

import router from './router'

import Ripple from 'primevue/ripple'

import InputNumber from 'primevue/inputnumber'
import DataTable from 'primevue/datatable'

import InputText from 'primevue/inputtext'





const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
  theme: { preset: Aura, options: { darkModeSelector: '.prime-dark' } },
})
document.documentElement.classList.remove('prime-dark', 'dark')

app.component('InputNumber', InputNumber)
app.component('DataTable', DataTable)

app.component('InputText', InputText)

app.mount('#app')

app.directive('ripple', Ripple)

